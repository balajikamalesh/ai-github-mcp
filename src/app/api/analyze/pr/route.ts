import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number } = body;
    const connection = request.headers.get('x-repo-connection');

    if (!connection || connection === 'undefined' || connection === 'null' || !number) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { owner, repo, token } = JSON.parse(connection);
    await mcpClient.configure({ owner, repo, token });
    const aiService = new AIService(process.env.GEMINI_API_KEY!);

    const prData = await mcpClient.getPullRequest(number, owner, repo);
    const stream = await aiService.analyzePullRequestStream(prData);

    return stream.toTextStreamResponse();
  } catch (error: any) {
    console.error('Analyze PR error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}