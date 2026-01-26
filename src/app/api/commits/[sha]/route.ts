import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sha: string }> }
) {
  try {
    const { sha } = await params;
    const connection = request.headers.get('x-repo-connection');

    if (!connection || connection === 'undefined' || connection === 'null') {
      return NextResponse.json({ error: 'No repository connected' }, { status: 401 });
    }

    const { owner, repo, token } = JSON.parse(connection);
    await mcpClient.configure({ owner, repo, token });
    
    const commit = await mcpClient.getCommit(sha, owner, repo);

    return NextResponse.json({ commit });
  } catch (error: any) {
    console.error('Get commit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}