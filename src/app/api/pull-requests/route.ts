import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = (searchParams.get('state') as 'open' | 'closed' | 'all') || 'all';
    const connection = request.headers.get('x-repo-connection');

    if (!connection || connection === 'undefined' || connection === 'null') {
      return NextResponse.json({ error: 'No repository connected' }, { status: 401 });
    }

    const { owner, repo, token } = JSON.parse(connection);
    await mcpClient.configure({ owner, repo, token });
    
    const pullRequests = await mcpClient.listPullRequests(state, 50, owner, repo);

    return NextResponse.json({ pullRequests });
  } catch (error: any) {
    console.error('List PRs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}