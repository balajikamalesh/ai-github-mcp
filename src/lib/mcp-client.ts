import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface RepoConnection {
  owner: string;
  repo: string;
  token?: string;
}

export class MCPClient {
  private client: Client | null = null;
  private config: RepoConnection | null = null;
  private static instance: MCPClient | null = null;

  private constructor() {}

  static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  async initialize() {
    if (this.client) {
      return; // Already initialized
    }

    try {
      const transport = new StdioClientTransport({
        command: 'node',
        args: ['./mcp-server/github-server.js'],
      });

      this.client = new Client(
        {
          name: 'github-analyzer-client',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      await this.client.connect(transport);
      console.log('MCP Client connected to GitHub server');
    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
      throw error;
    }
  }

  async configure(config: RepoConnection) {
    await this.ensureInitialized();
    this.config = config;

    const result = await this.client!.callTool({
      name: 'github_configure',
      arguments: {
        owner: config.owner,
        repo: config.repo,
        token: config.token,
      },
    });

    return this.parseResult(result);
  }

  async getRepoInfo(owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_get_repo',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
      },
    });

    return this.parseResult(result);
  }

  async listFiles(path: string = '', owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_list_files',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
        path,
      },
    });

    return this.parseResult(result);
  }

  async getFileContent(path: string, owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_get_file_content',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
        path,
      },
    });

    return this.parseResult(result);
  }

  async listCommits(limit: number = 30, sha?: string, owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_list_commits',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
        limit,
        sha,
      },
    });

    return this.parseResult(result);
  }

  async getCommit(sha: string, owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_get_commit',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
        sha,
      },
    });

    return this.parseResult(result);
  }

  async listPullRequests(
    state: 'open' | 'closed' | 'all' = 'all',
    limit: number = 30,
    owner?: string,
    repo?: string
  ) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_list_pull_requests',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
        state,
        limit,
      },
    });

    return this.parseResult(result);
  }

  async getPullRequest(number: number, owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_get_pull_request',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
        number,
      },
    });

    return this.parseResult(result);
  }

  async getRepoStructure(owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_get_repo_structure',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
      },
    });

    return this.parseResult(result);
  }

  async getLanguages(owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_get_languages',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
      },
    });

    return this.parseResult(result);
  }

  async getContributors(limit: number = 10, owner?: string, repo?: string) {
    await this.ensureInitialized();

    const result = await this.client!.callTool({
      name: 'github_get_contributors',
      arguments: {
        owner: owner || this.config?.owner,
        repo: repo || this.config?.repo,
        limit,
      },
    });

    return this.parseResult(result);
  }

  private async ensureInitialized() {
    if (!this.client) {
      await this.initialize();
    }
  }

  private parseResult(result: any) {
    if (result.isError) {
      const errorData = JSON.parse(result.content[0].text);
      throw new Error(errorData.error);
    }

    const text = result.content[0].text;
    return JSON.parse(text);
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

export const mcpClient = MCPClient.getInstance();