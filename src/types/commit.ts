export type CommitType = {
  sha: string;
  message: string;
  author: {
    name: string;
    date: string;
  };
  stats?: {
    additions: number;
    deletions: number;
  };
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
};
