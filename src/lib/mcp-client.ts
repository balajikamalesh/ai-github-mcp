import { githubService } from "./github-service";

export interface RepoConnection {
  owner: string;
  repo: string;
  token?: string;
}

export class MCPClient {
  private config: RepoConnection | null = null;
  private static instance: MCPClient | null = null;

  private constructor() {}

  static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  async configure(config: RepoConnection) {
    this.config = config;
    return await githubService.configure({
      owner: config.owner,
      repo: config.repo,
      token: config.token,
    });
  }

  async getRepoInfo(owner?: string, repo?: string) {
    return await githubService.getRepo({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
    });
  }

  async listFiles(path: string = "", owner?: string, repo?: string) {
    return await githubService.listFiles({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
      path,
    });
  }

  async getFileContent(path: string, owner?: string, repo?: string) {
    return await githubService.getFileContent({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
      path,
    });
  }

  async listCommits(
    limit: number = 30,
    sha?: string,
    owner?: string,
    repo?: string,
  ) {
    return await githubService.listCommits({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
      limit,
      sha,
    });
  }

  async getCommit(sha: string, owner?: string, repo?: string) {
    return await githubService.getCommit({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
      sha,
    });
  }

  async listPullRequests(
    state: "open" | "closed" | "all" = "all",
    limit: number = 30,
    owner?: string,
    repo?: string,
  ) {
    return await githubService.listPullRequests({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
      state,
      limit,
    });
  }

  async getPullRequest(number: number, owner?: string, repo?: string) {
    return await githubService.getPullRequest({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
      number,
    });
  }

  async getRepoStructure(owner?: string, repo?: string) {
    return await githubService.getRepoStructure({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
    });
  }

  async getLanguages(owner?: string, repo?: string) {
    return await githubService.getLanguages({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
    });
  }

  async getContributors(limit: number = 10, owner?: string, repo?: string) {
    return await githubService.getContributors({
      owner: owner || this.config?.owner,
      repo: repo || this.config?.repo,
      limit,
    });
  }
}

export const mcpClient = MCPClient.getInstance();
