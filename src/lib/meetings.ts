import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { markdownToHtml } from '@/lib/markdown';
import { KST_OFFSET_MS } from '@/lib/years';
import type { Meeting, MeetingType } from '@/lib/types';

const meetingsDirectory = path.join(process.cwd(), 'data/meetings');

// True only for a real calendar date (rejects e.g. 2025-13-01, 2025-02-30).
function isRealDate(y: number, mo: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

// Normalize a frontmatter date (string or Date) to YYYY-MM-DD in KST.
// Returns '' when the value is not a parseable, real calendar date.
function toDateString(value: unknown): string {
  if (typeof value === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (!m) return '';
    const [, y, mo, d] = m;
    return isRealDate(Number(y), Number(mo), Number(d)) ? `${y}-${mo}-${d}` : '';
  }
  const d = new Date(value as string | number | Date);
  if (Number.isNaN(d.getTime())) return '';
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  return `${kst.getUTCFullYear()}-${mm}-${dd}`;
}

function normalizeType(value: unknown): MeetingType {
  return value === 'milestone' || value === 'deadline' ? value : 'meeting';
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

      // Isolate per-file failures so one malformed file can't discard the
      // meetings already parsed (a single bad edit shouldn't blank the page).
      try {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(meetingsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const parsed = matter(fileContents);

        const date = toDateString(parsed.data.date);
        if (!date) {
          console.error('Skipping meeting with invalid date:', fileName);
          continue;
        }

        // Optional end date for period events; kept only when it's a real date
        // on/after the start.
        const end = parsed.data.end ? toDateString(parsed.data.end) : '';
        const endDate = end && end >= date ? end : undefined;

        meetings.push({
          slug,
          title: parsed.data.title || '제목 없음',
          date,
          endDate,
          badge: parsed.data.badge ? String(parsed.data.badge) : undefined,
          type: normalizeType(parsed.data.type),
          attendees: normalizeAttendees(parsed.data.attendees),
          location: parsed.data.location || undefined,
          contentHtml: markdownToHtml(parsed.content),
        });
      } catch (fileError) {
        console.error('Skipping unreadable meeting file:', fileName, fileError);
      }
    }

    // Date ascending; on the same date, single-day events come before period
    // events (so e.g. the 발대식 shows before the Challenges range banner).
    return meetings.sort(
      (a, b) =>
        a.date.localeCompare(b.date) || (a.endDate ? 1 : 0) - (b.endDate ? 1 : 0)
    );
  } catch (error) {
    console.error('Error getting meetings:', error);
    return [];
  }
}
