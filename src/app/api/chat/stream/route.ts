import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;
    const connection = request.headers.get('x-repo-connection');

    if (!connection || connection === 'undefined' || connection === 'null') {
      return NextResponse.json({ error: 'No repository connected' }, { status: 401 });
    }

    const { owner, repo, token } = JSON.parse(connection);
    await mcpClient.configure({ owner, repo, token });
    const aiService = new AIService(process.env.GEMINI_API_KEY!);

    // Determine context needed based on message
    const messageLower = message.toLowerCase();
    let context: any = {};
    
    // Always include basic repo info for general questions
    if (messageLower.includes('repository') || messageLower.includes('repo') || 
        messageLower.includes('about') || messageLower.includes('project') ||
        messageLower.includes('what is')) {
      context.repoInfo = await mcpClient.getRepoInfo(owner, repo);
      context.structure = await mcpClient.getRepoStructure(owner, repo);
    }
    
    if (messageLower.includes('commit')) {
      context.commits = await mcpClient.listCommits(20, undefined, owner, repo);
    }
    if (messageLower.includes('pull request') || messageLower.includes('pr')) {
      context.pullRequests = await mcpClient.listPullRequests('all', 10, owner, repo);
    }
    if (messageLower.includes('file') && !context.structure) {
      context.structure = await mcpClient.getRepoStructure(owner, repo);
    }

    const stream = await aiService.chatStream(message, context, history);

    return stream.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}