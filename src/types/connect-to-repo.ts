import z from "zod";

export const repoConnectionFormSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  token: z.string().min(1, "GitHub token is required"),
});