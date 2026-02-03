import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const connection = request.headers.get('x-repo-connection');

    if (!connection || connection === 'undefined' || connection === 'null') {
      return NextResponse.json({ error: 'No repository connected' }, { status: 401 });
    }

    const { owner, repo, token } = JSON.parse(connection);
    await mcpClient.configure({ owner, repo, token });
    const aiService = new AIService(process.env.GEMINI_API_KEY!);

    const [repoInfo, structure, commits, prs] = await Promise.all([
      mcpClient.getRepoInfo(owner, repo),
      mcpClient.getRepoStructure(owner, repo),
      mcpClient.listCommits(50, undefined, owner, repo),
      mcpClient.listPullRequests('all', 20, owner, repo),
    ]);

    const stream = await aiService.analyzeRepositoryStream(repoInfo, structure, commits, prs);

    return stream.toTextStreamResponse();
  } catch (error: any) {
    console.error('Analyze repo error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}