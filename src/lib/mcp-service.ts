// lib/mcp-service.ts
import { Octokit } from '@octokit/rest';

export interface RepoConnection {
  owner: string;
  repo: string;
  token?: string;
}

export class MCPService {
  private octokit: Octokit;
  private config: RepoConnection;

  constructor(config: RepoConnection) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token,
    });
  }

  private handleError(error: any): never {
    if (error.status === 403) {
      if (error.response?.headers?.['x-ratelimit-remaining'] === '0') {
        throw new Error('GitHub API rate limit exceeded. Please provide a valid GitHub token to increase your limit from 60 to 5,000 requests per hour. Create a token at https://github.com/settings/tokens');
      }
      throw new Error('Access forbidden. Check your token permissions or repository visibility.');
    }
    if (error.status === 401) {
      throw new Error('Invalid GitHub token. Please check your token and try again.');
    }
    if (error.status === 404) {
      throw new Error('Repository not found. Check the owner and repository name.');
    }
    throw error;
  }

  async getRepoInfo() {
    try {
      const { data } = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      });

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
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}