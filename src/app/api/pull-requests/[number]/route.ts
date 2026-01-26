import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const connection = request.headers.get('x-repo-connection');

    if (!connection || connection === 'undefined' || connection === 'null') {
      return NextResponse.json({ error: 'No repository connected' }, { status: 401 });
    }

    const { owner, repo, token } = JSON.parse(connection);
    await mcpClient.configure({ owner, repo, token });
    
    const pullRequest = await mcpClient.getPullRequest(parseInt(number), owner, repo);

    return NextResponse.json({ pullRequest });
  } catch (error: any) {
    console.error('Get PR error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}