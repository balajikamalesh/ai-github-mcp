import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const connection = request.headers.get('x-repo-connection');

    if (!connection || connection === 'undefined' || connection === 'null' || !path) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { owner, repo, token } = JSON.parse(connection);
    await mcpClient.configure({ owner, repo, token });
    
    const fileData = await mcpClient.getFileContent(path, owner, repo);

    return NextResponse.json(fileData);
  } catch (error: any) {
    console.error('Get file content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}