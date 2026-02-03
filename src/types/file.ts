export type FileType = {
  path: string;
  name: string;
  type: "file" | "dir";
  size?: number;
  sha?: string;
  url?: string;
};
