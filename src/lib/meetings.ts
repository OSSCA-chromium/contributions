import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { markdownToHtml } from '@/lib/markdown';
import { KST_OFFSET_MS } from '@/lib/years';
import type { Meeting, MeetingType } from '@/lib/types';

const meetingsDirectory = path.join(process.cwd(), 'data/meetings');

// Normalize a frontmatter date (string or Date) to YYYY-MM-DD in KST.
// Returns '' when the value is not a parseable date.
function toDateString(value: unknown): string {
  if (typeof value === 'string') {
    const m = /^\d{4}-\d{2}-\d{2}/.exec(value.trim());
    return m ? m[0] : '';
  }
  const d = new Date(value as string | number | Date);
  if (Number.isNaN(d.getTime())) return '';
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  return `${kst.getUTCFullYear()}-${mm}-${dd}`;
}

function normalizeType(value: unknown): MeetingType {
  return value === 'milestone' ? 'milestone' : 'meeting';
}

function normalizeAttendees(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (value) return [String(value)];
  return [];
}

// Read every meeting markdown file, normalized and sorted by date ascending.
export function getAllMeetings(): Meeting[] {
  try {
    if (!fs.existsSync(meetingsDirectory)) return [];

    const fileNames = fs.readdirSync(meetingsDirectory);

    const meetings: Meeting[] = [];
    for (const fileName of fileNames) {
      if (!fileName.endsWith('.md') || fileName === 'template.md') continue;

      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(meetingsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const parsed = matter(fileContents);

      const date = toDateString(parsed.data.date);
      if (!date) {
        console.error('Skipping meeting with invalid date:', fileName);
        continue;
      }

      meetings.push({
        slug,
        title: parsed.data.title || '제목 없음',
        date,
        type: normalizeType(parsed.data.type),
        attendees: normalizeAttendees(parsed.data.attendees),
        location: parsed.data.location || undefined,
        content: parsed.content,
        contentHtml: markdownToHtml(parsed.content),
      });
    }

    return meetings.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting meetings:', error);
    return [];
  }
}
