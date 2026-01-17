import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

export async function GET(request: NextRequest) {
  try {
    const connection = request.headers.get('x-repo-connection');
    
    if (!connection || connection === 'undefined' || connection === 'null') {
      return NextResponse.json(
        { error: 'No repository connected' },
        { status: 401 }
      );
    }

    const { owner, repo, token } = JSON.parse(connection);

    // Configure MCP client
    await mcpClient.configure({ owner, repo, token });

    // Fetch data through MCP server
    const [repoInfo, structure, commits, prs, contributors] = await Promise.all([
      mcpClient.getRepoInfo(owner, repo),
      mcpClient.getRepoStructure(owner, repo),
      mcpClient.listCommits(10, undefined, owner, repo),
      mcpClient.listPullRequests('all', 10, owner, repo),
      mcpClient.getContributors(10, owner, repo),
    ]);

    const openPRs = prs.filter((pr: any) => pr.state === 'open').length;

    const recentActivity = [
      ...commits.slice(0, 5).map((c: any) => ({
        type: 'commit',
        message: c.message.split('\n')[0],
        author: c.author.name,
        date: new Date(c.author.date).toLocaleDateString(),
      })),
      ...prs.slice(0, 3).map((pr: any) => ({
        type: 'pr',
        message: `PR #${pr.number}: ${pr.title}`,
        author: pr.author.login,
        date: new Date(pr.createdAt).toLocaleDateString(),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return NextResponse.json({
      repo: repoInfo,
      stats: {
        totalFiles: structure.length,
        recentCommits: commits.length,
        openPRs,
        contributors: contributors.length,
        recentActivity,
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}