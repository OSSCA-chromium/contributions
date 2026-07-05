import fs from 'fs';
import { getAllMeetings } from '@/lib/meetings';

// fs만 모킹하고 gray-matter는 실제 파서를 사용(배열/Date 파싱 검증)
jest.mock('fs');

const FILE_A = `---
title: 3주차 정기 미팅
date: 2025-05-15
type: meeting
attendees: [alice, bob, carol]
location: 온라인
---
## 계획
- 코드리뷰 실습
`;

const FILE_B = `---
title: 발대식
date: 2025-05-01
type: milestone
---
## 안내
발대식 안내
`;

const NO_TYPE = `---
title: 타입 없는 미팅
date: 2025-05-20
attendees: alice
---
본문
`;

describe('getAllMeetings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([
      'a.md',
      'b.md',
      'c.md',
      'template.md',
      'notes.txt',
    ]);
    (fs.readFileSync as jest.Mock).mockImplementation((p: string) => {
      if (p.includes('a.md')) return FILE_A;
      if (p.includes('b.md')) return FILE_B;
      if (p.includes('c.md')) return NO_TYPE;
      if (p.includes('template.md')) return '---\ntitle: t\ndate: 2025-01-01\n---\n';
      return '';
    });
  });

  it('template.md와 비-markdown을 제외하고 날짜 오름차순으로 반환한다', () => {
    const meetings = getAllMeetings();
    expect(meetings.map((m) => m.slug)).toEqual(['b', 'a', 'c']);
  });

  it('frontmatter를 정규화한다(date=YYYY-MM-DD, attendees 배열, type 기본 meeting)', () => {
    const meetings = getAllMeetings();
    const a = meetings.find((m) => m.slug === 'a')!;
    expect(a.date).toBe('2025-05-15');
    expect(a.type).toBe('meeting');
    expect(a.attendees).toEqual(['alice', 'bob', 'carol']);
    expect(a.location).toBe('온라인');
    expect(a.contentHtml).toContain('코드리뷰 실습');

    const b = meetings.find((m) => m.slug === 'b')!;
    expect(b.type).toBe('milestone');
    expect(b.attendees).toEqual([]);

    const c = meetings.find((m) => m.slug === 'c')!;
    expect(c.type).toBe('meeting'); // 기본값
    expect(c.attendees).toEqual(['alice']); // 스칼라 → 배열
  });

  it('디렉터리가 없으면 빈 배열', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    expect(getAllMeetings()).toEqual([]);
  });

  it('end가 있으면 endDate로 파싱하고, 시작보다 이르면 무시한다', () => {
    (fs.readdirSync as jest.Mock).mockReturnValue(['period.md', 'badend.md']);
    (fs.readFileSync as jest.Mock).mockImplementation((p: string) => {
      if (p.includes('period.md'))
        return '---\ntitle: 기간\ndate: 2026-07-11\nend: 2026-08-14\ntype: milestone\n---\n본문\n';
      return '---\ntitle: 역전\ndate: 2026-07-11\nend: 2026-07-01\ntype: milestone\n---\n본문\n';
    });
    const meetings = getAllMeetings();
    expect(meetings.find((m) => m.slug === 'period')!.endDate).toBe('2026-08-14');
    expect(meetings.find((m) => m.slug === 'badend')!.endDate).toBeUndefined();
  });

  it('slides 필드를 문자열로 파싱하고, 빈 값은 undefined로 둔다', () => {
    (fs.readdirSync as jest.Mock).mockReturnValue(['deck.md', 'nodeck.md', 'blank.md']);
    (fs.readFileSync as jest.Mock).mockImplementation((p: string) => {
      if (p.includes('nodeck.md'))
        return '---\ntitle: 노슬라이드\ndate: 2026-07-19\ntype: meeting\n---\n본문\n';
      if (p.includes('deck.md'))
        return '---\ntitle: 1주차\ndate: 2026-07-18\ntype: meeting\nslides: /slides/2026-07-18-week1/\n---\n본문\n';
      return '---\ntitle: 빈값\ndate: 2026-07-20\ntype: meeting\nslides: "  "\n---\n본문\n';
    });
    const meetings = getAllMeetings();
    expect(meetings.find((m) => m.slug === 'deck')!.slides).toBe('/slides/2026-07-18-week1/');
    expect(meetings.find((m) => m.slug === 'nodeck')!.slides).toBeUndefined();
    expect(meetings.find((m) => m.slug === 'blank')!.slides).toBeUndefined();
  });

  it('한 파일의 YAML이 깨져도 유효한 미팅은 유지한다', () => {
    (fs.readdirSync as jest.Mock).mockReturnValue(['a.md', 'broken.md']);
    (fs.readFileSync as jest.Mock).mockImplementation((p: string) => {
      if (p.includes('a.md')) return FILE_A;
      // Unterminated flow sequence → js-yaml throws inside gray-matter.
      return '---\nlabels: [unclosed\ndate: 2025-05-10\n---\nbody\n';
    });
    const meetings = getAllMeetings();
    expect(meetings.map((m) => m.slug)).toEqual(['a']);
  });

  it('달력상 존재하지 않는 날짜 문자열("2025-13-01")은 건너뛴다', () => {
    (fs.readdirSync as jest.Mock).mockReturnValue(['a.md', 'baddate.md']);
    (fs.readFileSync as jest.Mock).mockImplementation((p: string) => {
      if (p.includes('a.md')) return FILE_A;
      // Quoted so YAML keeps it a string (unquoted would roll over to a real
      // Date); the string path must reject the impossible calendar date.
      return '---\ntitle: 잘못된 날짜\ndate: "2025-13-01"\n---\n본문\n';
    });
    const meetings = getAllMeetings();
    expect(meetings.map((m) => m.slug)).toEqual(['a']);
  });
});
