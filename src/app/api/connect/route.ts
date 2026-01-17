import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, token } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo are required' },
        { status: 400 }
      );
    }

    // Configure MCP client with repository details
    await mcpClient.configure({ owner, repo, token });

    // Get repository info through MCP
    const repoInfo = await mcpClient.getRepoInfo(owner, repo);

    return NextResponse.json({
      success: true,
      data: repoInfo,
      connection: { owner, repo, token },
    });
  } catch (error: any) {
    console.error('Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to repository' },
      { status: 500 }
    );
  }
}