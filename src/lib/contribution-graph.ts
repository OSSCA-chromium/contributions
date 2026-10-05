import type { SearchIndexItem } from '@/lib/types';

const PROJECT_LABELS: Record<string, string> = {
  'chromium/src': 'Chromium',
  'v8/v8': 'V8',
  'devtools/devtools-frontend': 'DevTools frontend',
};

export interface GraphNode extends SearchIndexItem { project: string }
export interface GraphEdge { source: string; target: string; reason: 'issue' | 'related' }
export interface ProjectCloud { repo: string; label: string; count: number }
export interface ContributionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  projects: ProjectCloud[];
  relatedPatchCount: number;
}

export function createContributionGraph(items: SearchIndexItem[]): ContributionGraph {
  const nodes = items.map(item => ({ ...item, project: item.repo?.trim() || 'chromium/src' }));
  const bySlug = new Map(nodes.map(node => [node.slug, node]));
  const counts = new Map<string, number>();
  const edges = new Map<string, GraphEdge>();
  const connected = new Set<string>();
  for (const node of nodes) {
    counts.set(node.project, (counts.get(node.project) || 0) + 1);
    for (const slug of node.relatedSlugs) {
      const other = bySlug.get(slug);
      if (!other || slug === node.slug) continue;
      const [source, target] = [node.slug, slug].sort();
      const reason = node.issue && node.issue === other.issue ? 'issue' : 'related';
      edges.set(`${source}:${target}`, { source, target, reason });
      connected.add(source);
      connected.add(target);
    }
  }
  const projects = Array.from(counts, ([repo, count]) => ({ repo, count, label: PROJECT_LABELS[repo] || repo }))
    .sort((a, b) => b.count - a.count || a.repo.localeCompare(b.repo));
  return { nodes, edges: Array.from(edges.values()), projects, relatedPatchCount: connected.size };
}

export interface PositionedCloud extends ProjectCloud {
  x: number; y: number; width: number; height: number;
}
export interface PositionedNode extends GraphNode { x: number; y: number }

// The layout is deterministic so filtering and static rendering never depend
// on a random seed. Each repository retains its own cloud, even for one patch.
export function layoutContributionGraph(graph: ContributionGraph, width: number, compact = false) {
  const narrow = width < 640;
  const gap = 16;
  const secondary = graph.projects.length - 1;
  const mainHeight = compact ? 280 : 340;
  const rowHeight = compact ? 160 : 190;
  const height = narrow ? mainHeight + Math.ceil(Math.max(secondary, 0) / 2) * rowHeight : Math.max(compact ? 320 : 420, secondary * (compact ? 140 : 160));
  const clouds: PositionedCloud[] = graph.projects.map((project, index) => {
    if (!secondary) return { ...project, x: 8, y: 8, width: width - 16, height: height - 16 };
    if (narrow) {
      if (!index) return { ...project, x: 8, y: 8, width: width - 16, height: mainHeight - 20 };
      const cellWidth = (width - gap * 3) / 2;
      return { ...project, x: gap + ((index - 1) % 2) * (cellWidth + gap), y: mainHeight + 4 + Math.floor((index - 1) / 2) * rowHeight, width: cellWidth, height: rowHeight - 18 };
    }
    const mainWidth = width * 0.68;
    if (!index) return { ...project, x: 8, y: 8, width: mainWidth - 16, height: height - 16 };
    const cellHeight = height / secondary;
    return { ...project, x: mainWidth + 8, y: (index - 1) * cellHeight + 8, width: width - mainWidth - 16, height: cellHeight - 16 };
  });
  const positioned: PositionedNode[] = [];
  for (const cloud of clouds) {
    const members = graph.nodes.filter(node => node.project === cloud.repo).sort((a, b) => a.slug.localeCompare(b.slug));
    const cx = cloud.x + cloud.width / 2;
    const cy = cloud.y + cloud.height * 0.67;
    const rx = Math.max(16, cloud.width * 0.40);
    const ry = Math.max(16, cloud.height * 0.22);
    const points = members.map((node, i) => {
      const angle = i * 2.399963229728653;
      const radius = Math.sqrt((i + 0.5) / members.length);
      return { ...node, x: cx + Math.cos(angle) * radius * rx, y: cy + Math.sin(angle) * radius * ry };
    });
    const spacing = Math.max(13, Math.min(28, Math.sqrt(Math.PI * rx * ry / Math.max(members.length, 1)) * 0.9));
    const local = new Map(points.map((node, i) => [node.slug, i]));
    const springs = graph.edges.filter(edge => local.has(edge.source) && local.has(edge.target));
    // Repulsion separates points; real relationships pull connected patches
    // together without collapsing all members of a large issue into one dot.
    for (let step = 0; step < 70; step++) {
      const forces = points.map(node => ({ x: (cx - node.x) * 0.003, y: (cy - node.y) * 0.003 }));
      for (let a = 0; a < points.length; a++) for (let b = a + 1; b < points.length; b++) {
        const dx = points[a].x - points[b].x;
        const dy = points[a].y - points[b].y;
        const d2 = Math.max(dx * dx + dy * dy, 4);
        const d = Math.sqrt(d2);
        const strength = Math.max(0, spacing - d) * 0.18;
        forces[a].x += dx / d * strength; forces[a].y += dy / d * strength;
        forces[b].x -= dx / d * strength; forces[b].y -= dy / d * strength;
      }
      for (const edge of springs) {
        const a = local.get(edge.source)!; const b = local.get(edge.target)!;
        const dx = points[b].x - points[a].x; const dy = points[b].y - points[a].y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const pull = Math.max(0, d - 35) * 0.002;
        forces[a].x += dx / d * pull; forces[a].y += dy / d * pull;
        forces[b].x -= dx / d * pull; forces[b].y -= dy / d * pull;
      }
      points.forEach((node, i) => {
        node.x += forces[i].x; node.y += forces[i].y;
        const normalized = Math.hypot((node.x - cx) / rx, (node.y - cy) / ry);
        if (normalized > 1) { node.x = cx + (node.x - cx) / normalized; node.y = cy + (node.y - cy) / normalized; }
      });
    }
    // V8 math can differ in the last floating-point digits between Node and
    // Chrome. Round SVG coordinates to keep server and client markup equal.
    positioned.push(...points.map(node => ({ ...node, x: Number(node.x.toFixed(2)), y: Number(node.y.toFixed(2)) })));
  }
  return { nodes: positioned, clouds, height };
}
