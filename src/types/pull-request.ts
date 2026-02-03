export type PullRequestType = {
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  author: {
    login: string;
  };
  createdAt: string;
  head: string;
  base: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
};
