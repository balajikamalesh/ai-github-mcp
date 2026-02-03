"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const rest_1 = require("@octokit/rest");
class GitHubMCPServer {
    server;
    octokit = null;
    config = {};
    constructor() {
        this.server = new index_js_1.Server({
            name: "github-analyzer-mcp",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: this.getTools(),
        }));
        // Handle tool calls
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "github_configure":
                        return await this.configure(args);
                    case "github_get_repo":
                        return await this.getRepo(args);
                    case "github_list_files":
                        return await this.listFiles(args);
                    case "github_get_file_content":
                        return await this.getFileContent(args);
                    case "github_list_commits":
                        return await this.listCommits(args);
                    case "github_get_commit":
                        return await this.getCommit(args);
                    case "github_list_pull_requests":
                        return await this.listPullRequests(args);
                    case "github_get_pull_request":
                        return await this.getPullRequest(args);
                    case "github_get_repo_structure":
                        return await this.getRepoStructure(args);
                    case "github_get_languages":
                        return await this.getLanguages(args);
                    case "github_get_contributors":
                        return await this.getContributors(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                error: error.message,
                                details: error.response?.data || null,
                            }),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    getTools() {
        return [
            {
                name: "github_configure",
                description: "Configure GitHub connection with owner, repo, and optional token",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: {
                            type: "string",
                            description: "Repository owner/organization",
                        },
                        repo: {
                            type: "string",
                            description: "Repository name",
                        },
                        token: {
                            type: "string",
                            description: "GitHub personal access token (optional for public repos)",
                        },
                    },
                    required: ["owner", "repo"],
                },
            },
            {
                name: "github_get_repo",
                description: "Get repository information",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                    },
                },
            },
            {
                name: "github_list_files",
                description: "List files and directories at a given path",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                        path: {
                            type: "string",
                            description: "Path in the repository (default: root)",
                            default: "",
                        },
                    },
                },
            },
            {
                name: "github_get_file_content",
                description: "Get the content of a specific file",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                        path: {
                            type: "string",
                            description: "Path to the file",
                        },
                    },
                    required: ["path"],
                },
            },
            {
                name: "github_list_commits",
                description: "List commits in the repository",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                        limit: {
                            type: "number",
                            description: "Number of commits to retrieve",
                            default: 30,
                        },
                        sha: {
                            type: "string",
                            description: "Branch name or commit SHA",
                        },
                    },
                },
            },
            {
                name: "github_get_commit",
                description: "Get detailed information about a specific commit",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                        sha: {
                            type: "string",
                            description: "Commit SHA",
                        },
                    },
                    required: ["sha"],
                },
            },
            {
                name: "github_list_pull_requests",
                description: "List pull requests in the repository",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                        state: {
                            type: "string",
                            enum: ["open", "closed", "all"],
                            description: "PR state filter",
                            default: "all",
                        },
                        limit: {
                            type: "number",
                            description: "Number of PRs to retrieve",
                            default: 30,
                        },
                    },
                },
            },
            {
                name: "github_get_pull_request",
                description: "Get detailed information about a specific pull request",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                        number: {
                            type: "number",
                            description: "PR number",
                        },
                    },
                    required: ["number"],
                },
            },
            {
                name: "github_get_repo_structure",
                description: "Get the complete directory tree structure",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                    },
                },
            },
            {
                name: "github_get_languages",
                description: "Get programming languages used in the repository",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                    },
                },
            },
            {
                name: "github_get_contributors",
                description: "Get repository contributors",
                inputSchema: {
                    type: "object",
                    properties: {
                        owner: { type: "string" },
                        repo: { type: "string" },
                        limit: {
                            type: "number",
                            description: "Number of contributors",
                            default: 10,
                        },
                    },
                },
            },
        ];
    }
    ensureOctokit(args) {
        const owner = args.owner || this.config.owner;
        const repo = args.repo || this.config.repo;
        const token = args.token || this.config.token;
        if (!owner || !repo) {
            throw new Error("Owner and repo must be configured");
        }
        if (!this.octokit || args.token) {
            this.octokit = new rest_1.Octokit({ auth: token });
        }
        return { owner, repo };
    }
    async configure(args) {
        this.config = {
            owner: args.owner,
            repo: args.repo,
            token: args.token,
        };
        this.octokit = new rest_1.Octokit({ auth: args.token });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        configured: {
                            owner: args.owner,
                            repo: args.repo,
                            hasToken: !!args.token,
                        },
                    }),
                },
            ],
        };
    }
    async getRepo(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.repos.get({ owner, repo });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
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
                    }),
                },
            ],
        };
    }
    async listFiles(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const path = args.path || "";
        const { data } = await this.octokit.repos.getContent({
            owner,
            repo,
            path,
        });
        const files = Array.isArray(data) ? data : [data];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(files.map((file) => ({
                        name: file.name,
                        path: file.path,
                        type: file.type,
                        size: file.size,
                        sha: file.sha,
                        url: file.html_url,
                    }))),
                },
            ],
        };
    }
    async getFileContent(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.repos.getContent({
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
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        path: data.path,
                        content,
                        size: data.size,
                        sha: data.sha,
                        url: data.html_url,
                    }),
                },
            ],
        };
    }
    async listCommits(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.repos.listCommits({
            owner,
            repo,
            per_page: args.limit || 30,
            sha: args.sha,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.map((commit) => ({
                        sha: commit.sha,
                        message: commit.commit.message,
                        author: {
                            name: commit.commit.author?.name,
                            email: commit.commit.author?.email,
                            date: commit.commit.author?.date,
                            avatar: commit.author?.avatar_url,
                        },
                        url: commit.html_url,
                    }))),
                },
            ],
        };
    }
    async getCommit(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.repos.getCommit({
            owner,
            repo,
            ref: args.sha,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
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
                    }),
                },
            ],
        };
    }
    async listPullRequests(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.pulls.list({
            owner,
            repo,
            state: args.state || "all",
            per_page: args.limit || 30,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.map((pr) => ({
                        number: pr.number,
                        title: pr.title,
                        state: pr.state,
                        author: {
                            login: pr.user?.login,
                            avatar: pr.user?.avatar_url,
                        },
                        createdAt: pr.created_at,
                        updatedAt: pr.updated_at,
                        // additions: pr.additions,
                        // deletions: pr.deletions,
                        // changedFiles: pr.changed_files,
                        url: pr.html_url,
                    }))),
                },
            ],
        };
    }
    async getPullRequest(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.pulls.get({
            owner,
            repo,
            pull_number: args.number,
        });
        // Fetch PR files with diffs
        const { data: filesData } = await this.octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: args.number,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
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
                    }),
                },
            ],
        };
    }
    async getRepoStructure(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.git.getTree({
            owner,
            repo,
            tree_sha: "HEAD",
            recursive: "true",
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.tree.map((item) => ({
                        path: item.path,
                        type: item.type,
                        size: item.size,
                        sha: item.sha,
                    }))),
                },
            ],
        };
    }
    async getLanguages(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.repos.listLanguages({
            owner,
            repo,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data),
                },
            ],
        };
    }
    async getContributors(args) {
        const { owner, repo } = this.ensureOctokit(args);
        const { data } = await this.octokit.repos.listContributors({
            owner,
            repo,
            per_page: args.limit || 10,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data.map((contributor) => ({
                        login: contributor.login,
                        avatar: contributor.avatar_url,
                        contributions: contributor.contributions,
                        url: contributor.html_url,
                    }))),
                },
            ],
        };
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        // Log to stderr so it doesn't interfere with stdio communication
        console.error("GitHub MCP Server running on stdio");
    }
}
// Start the server
const server = new GitHubMCPServer();
server.run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
