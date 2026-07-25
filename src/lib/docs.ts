import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { markdownToHtml, extractHeadings } from '@/lib/markdown';
import type { DocMeta } from '@/lib/types';

const docsDirectory = path.join(process.cwd(), 'data/docs');

// data/docs 의 .md 파일을 읽어 DocMeta 로 파싱
function readDocMeta(fileName: string): DocMeta {
  const slug = fileName.replace(/\.md$/, '');
  const fullPath = path.join(docsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    title: matterResult.data.title || slug,
    order:
      typeof matterResult.data.order === 'number'
        ? matterResult.data.order
        : Number.MAX_SAFE_INTEGER,
    group: matterResult.data.group,
    description: matterResult.data.description || undefined,
  };
}

// 모든 문서 메타데이터를 order 순으로 반환
export function getAllDocs(): DocMeta[] {
  try {
    if (!fs.existsSync(docsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(docsDirectory);

    return fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map(readDocMeta)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error getting docs:', error);
    return [];
  }
}

// 사이드바/이전다음 내비게이션용 (order 정렬)
export function getDocNav(): DocMeta[] {
  return getAllDocs();
}

// 정적 생성을 위한 슬러그 목록
export function getDocSlugs(): { slug: string }[] {
  return getAllDocs().map((doc) => ({ slug: doc.slug }));
}

// 특정 문서의 메타/본문 HTML/목차 반환
export async function getDocBySlug(slug: string): Promise<{
  meta: DocMeta;
  contentHtml: string;
  headings: { id: string; text: string; level: number }[];
} | null> {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const contentHtml = markdownToHtml(matterResult.content);
    const headings = extractHeadings(matterResult.content);

    return {
      meta: {
        slug,
        title: matterResult.data.title || slug,
        order:
          typeof matterResult.data.order === 'number'
            ? matterResult.data.order
            : Number.MAX_SAFE_INTEGER,
        group: matterResult.data.group,
        description: matterResult.data.description || undefined,
      },
      contentHtml,
      headings,
    };
  } catch (error) {
    console.error('Error getting doc:', error);
    return null;
  }
}
