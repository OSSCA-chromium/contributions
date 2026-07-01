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
}
