export type ContributionStatus = 'in review' | 'merged' | 'draft';

export interface Contribution {
  slug: string;
  title: string;
  date: string;
  author: string;
  contributionUrl?: string;
  labels: string[];
  status?: ContributionStatus;
  excerpt: string;
  content?: string;
  contentHtml?: string;
}

export interface SearchIndexItem {
  slug: string;
  title: string;
  author: string;
  labels: string[];
  status?: ContributionStatus;
  date: string;
  excerpt: string;
}

export interface ContributorSummary {
  username: string;
  isValidGithubUser: boolean;
  total: number;
  merged: number;
  inReview: number;
  // ISO date of the contributor's most recent contribution (max date).
  lastActive: string;
}

export interface Stats {
  total: number;
  byStatus: { status: string; count: number }[];
  byMonth: { month: string; count: number }[];
  topContributors: { username: string; count: number }[];
  contributorCount: number;
  mergedRatio: number;
}

export interface DocMeta {
  slug: string;
  title: string;
  order: number;
  group?: string;
  description?: string; // 인덱스 목록에 보여줄 한 줄 소개
}

export type MeetingType = 'meeting' | 'milestone' | 'deadline';

export interface Meeting {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD (KST 정규화) — 시작일
  endDate?: string; // YYYY-MM-DD — 기간 일정의 종료일 (있으면 date~endDate 범위)
  badge?: string; // 목록에 표시할 짧은 카테고리 칩 라벨 (예: Challenges, Masters)
  type: MeetingType;
  attendees: string[];
  location?: string;
  slides?: string; // 사이트 내 HTML 덱 경로(/slides/...) 또는 외부 URL
  content?: string;
  contentHtml?: string;
}

export interface AttendanceRecord {
  username: string;
  attended: number;
  totalMeetings: number;
  rate: number; // 0..1
}

export interface AttendanceStats {
  meetingCount: number;
  milestoneCount: number;
  rosterSize: number;
  records: AttendanceRecord[]; // rate desc, then username asc
}
