import { NextRequest, NextResponse } from "next/server";
import { MCPService } from "@/lib/mcp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, token } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        {
          error:
            "GitHub token is required. Get a token at https://github.com/settings/tokens",
        },
        { status: 400 }
      );
    }

    const mcpService = new MCPService({ owner, repo, token });
    const repoInfo = await mcpService.getRepoInfo();

    return NextResponse.json({
      connection: { owner, repo, token },
      data: repoInfo,
    });
  } catch (error: any) {
    if (error.status === 403 && error.message?.includes("rate limit")) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit exceeded. Please provide a valid GitHub token to increase your rate limit from 60 to 5,000 requests per hour.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to connect to repository" },
      { status: 500 }
    );
  }
}
