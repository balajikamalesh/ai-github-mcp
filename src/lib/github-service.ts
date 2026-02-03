import { Octokit } from "@octokit/rest";

interface GitHubConfig {
  token?: string;
  owner?: string;
  repo?: string;
}

export class GitHubService {
  private octokit: Octokit | null = null;
  private config: GitHubConfig = {};
  private static instance: GitHubService | null = null;

  private constructor() {}

  static getInstance(): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService();
    }
    return GitHubService.instance;
  }

  private ensureOctokit(
    args: { owner?: string; repo?: string; token?: string } = {},
  ) {
    const owner = args.owner || this.config.owner;
    const repo = args.repo || this.config.repo;
    const token = args.token || this.config.token;

    if (!owner || !repo) {
      throw new Error("Owner and repo must be configured");
    }

    if (!this.octokit || args.token) {
      this.octokit = new Octokit({ auth: token });
    }

    return { owner, repo };
  }

  async configure(config: { owner: string; repo: string; token?: string }) {
    this.config = {
      owner: config.owner,
      repo: config.repo,
      token: config.token,
    };

    this.octokit = new Octokit({ auth: config.token });

    return {
      success: true,
      configured: {
        owner: config.owner,
        repo: config.repo,
        hasToken: !!config.token,
      },
    };
  }

  async getRepo(args: { owner?: string; repo?: string } = {}) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.repos.get({ owner, repo });

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      defaultBranch: data.default_branch,
      size: data.size,
      openIssues: data.open_issues_count,
      homepage: data.homepage,
      license: data.license?.name,
    };
  }

  async listFiles(args: { owner?: string; repo?: string; path?: string } = {}) {
    const { owner, repo } = this.ensureOctokit(args);
    const path = args.path || "";

    const { data } = await this.octokit!.repos.getContent({
      owner,
      repo,
      path,
    });

    const files = Array.isArray(data) ? data : [data];

    return files.map((file) => ({
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size,
      sha: file.sha,
      url: file.html_url,
    }));
  }

  async getFileContent(args: { owner?: string; repo?: string; path: string }) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.repos.getContent({
      owner,
      repo,
      path: args.path,
    });

    if (Array.isArray(data)) {
      throw new Error("Path is a directory, not a file");
    }

    if (data.type !== "file") {
      throw new Error(`Path is a ${data.type}, not a file`);
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      path: data.path,
      content,
      size: data.size,
      sha: data.sha,
      url: data.html_url,
    };
  }

  async listCommits(
    args: { owner?: string; repo?: string; limit?: number; sha?: string } = {},
  ) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.repos.listCommits({
      owner,
      repo,
      per_page: args.limit || 30,
      sha: args.sha,
    });

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author?.name,
        email: commit.commit.author?.email,
        date: commit.commit.author?.date,
        avatar: commit.author?.avatar_url,
      },
      url: commit.html_url,
    }));
  }

  async getCommit(args: { owner?: string; repo?: string; sha: string }) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.repos.getCommit({
      owner,
      repo,
      ref: args.sha,
    });

    return {
      sha: data.sha,
      message: data.commit.message,
      author: {
        name: data.commit.author?.name,
        email: data.commit.author?.email,
        date: data.commit.author?.date,
        avatar: data.author?.avatar_url,
      },
      stats: {
        additions: data.stats?.additions,
        deletions: data.stats?.deletions,
        total: data.stats?.total,
      },
      files: data.files?.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
      })),
      url: data.html_url,
    };
  }

  async listPullRequests(
    args: {
      owner?: string;
      repo?: string;
      state?: "open" | "closed" | "all";
      limit?: number;
    } = {},
  ) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.pulls.list({
      owner,
      repo,
      state: args.state || "all",
      per_page: args.limit || 30,
    });

    return data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      author: {
        login: pr.user?.login,
        avatar: pr.user?.avatar_url,
      },
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      url: pr.html_url,
    }));
  }

  async getPullRequest(args: {
    owner?: string;
    repo?: string;
    number: number;
  }) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.pulls.get({
      owner,
      repo,
      pull_number: args.number,
    });

    // Fetch PR files with diffs
    const { data: filesData } = await this.octokit!.pulls.listFiles({
      owner,
      repo,
      pull_number: args.number,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      author: {
        login: data.user?.login,
        avatar: data.user?.avatar_url,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      mergedAt: data.merged_at,
      additions: data.additions,
      deletions: data.deletions,
      changedFiles: data.changed_files,
      commits: data.commits,
      url: data.html_url,
      head: data.head.ref,
      base: data.base.ref,
      files: filesData.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
        previous_filename: file.previous_filename,
      })),
    };
  }

  async getRepoStructure(args: { owner?: string; repo?: string } = {}) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.git.getTree({
      owner,
      repo,
      tree_sha: "HEAD",
      recursive: "true",
    });

    return data.tree.map((item) => ({
      path: item.path,
      type: item.type,
      size: item.size,
      sha: item.sha,
    }));
  }

  async getLanguages(args: { owner?: string; repo?: string } = {}) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.repos.listLanguages({
      owner,
      repo,
    });

    return data;
  }

  async getContributors(
    args: { owner?: string; repo?: string; limit?: number } = {},
  ) {
    const { owner, repo } = this.ensureOctokit(args);

    const { data } = await this.octokit!.repos.listContributors({
      owner,
      repo,
      per_page: args.limit || 10,
    });

    return data.map((contributor) => ({
      login: contributor.login,
      avatar: contributor.avatar_url,
      contributions: contributor.contributions,
      url: contributor.html_url,
    }));
  }
}

export const githubService = GitHubService.getInstance();
