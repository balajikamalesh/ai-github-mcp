// lib/ai-service.ts
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export class AIService {
  private model;

  constructor(apiKey: string) {
    this.model = google("gemini-2.0-flash");
  }

  async chatStream(message: string, context: any, history: Message[] = []) {
    const historyText = history
      .slice(-5)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    const contextText = context
      ? JSON.stringify(context, null, 2)
      : "No additional context";

    const prompt = `You are an AI assistant analyzing a GitHub repository.

${historyText ? `**Conversation History**:\n${historyText}\n\n` : ""}

**Current Context**:
${contextText}

**User Question**: ${message}

Provide a helpful, detailed response based on the repository data. Be conversational but informative.`;

    const result = await streamText({
      model: this.model,
      prompt,
    });

    return result;
  }

  // Streaming version for file analysis
  async analyzeFileStream(fileData: any) {
    const prompt = `Analyze this file from a GitHub repository:

File: ${fileData.path}
Size: ${fileData.size} bytes

Content:
${fileData.content}

Provide a comprehensive analysis including:
1. **Purpose and Functionality**: What does this file do?
2. **Code Quality**: Assessment of code structure, readability, and best practices
3. **Dependencies**: What other files or libraries does it depend on?
4. **Potential Improvements**: Suggestions for enhancement
5. **Security Considerations**: Any security concerns or recommendations

Please be concise but thorough.`;

    const result = await streamText({
      model: this.model,
      prompt,
    });

    return result;
  }

  // Streaming version for commit analysis
  async analyzeCommitStream(commitData: any) {
    const filesChanged =
      commitData.files
        ?.map((f: any) => `- ${f.filename} (+${f.additions}/-${f.deletions})`)
        .join("\n") || "No file details available";

    // Include actual code diffs for deeper analysis
    const fileDiffs =
      commitData.files
        ?.slice(0, 10)
        .map((f: any) => {
          if (f.patch) {
            return `\n### ${f.filename} (${f.status})\n\`\`\`diff\n${f.patch}\n\`\`\``;
          }
          return `\n### ${f.filename} (${f.status}) - Binary or no diff available`;
        })
        .join("\n") || "";

    const prompt = `Analyze this commit from a GitHub repository:

**Commit**: ${commitData.sha.substring(0, 7)}
**Author**: ${commitData.author.name}
**Date**: ${commitData.author.date}
**Message**: ${commitData.message}

**Statistics**:
- Additions: ${commitData.stats?.additions || 0}
- Deletions: ${commitData.stats?.deletions || 0}
- Files Changed: ${commitData.files?.length || 0}

**Files Changed**:
${filesChanged}

**Code Changes** (showing up to 10 files with diffs):
${fileDiffs}

Provide detailed analysis on:
1. **Impact**: What is the scope and impact of these changes?
2. **Code Quality**: Assessment of the actual code changes, patterns, and practices
3. **Security & Risks**: Potential security issues or risks in the code changes
4. **Suggestions**: Specific improvements based on the code diffs
5. **Context**: How this fits into the project's development

Be thorough, specific, and actionable based on the actual code changes.`;

    const result = await streamText({
      model: this.model,
      prompt,
    });

    return result;
  }

  // Streaming version for pull request analysis
  async analyzePullRequestStream(prData: any) {
    // Include file changes summary
    const filesChanged =
      prData.files
        ?.map(
          (f: any) =>
            `- ${f.filename} (${f.status}) (+${f.additions}/-${f.deletions})`,
        )
        .join("\n") || "No file details available";

    // Include actual code diffs for deep analysis (limit to first 10 files to avoid token limits)
    const fileDiffs =
      prData.files
        ?.slice(0, 10)
        .map((f: any) => {
          if (f.patch) {
            return `\n### ${f.filename} (${f.status})${f.previous_filename ? ` - renamed from ${f.previous_filename}` : ""}\n\`\`\`diff\n${f.patch}\n\`\`\``;
          }
          return `\n### ${f.filename} (${f.status}) - Binary or no diff available`;
        })
        .join("\n") || "";

    const prompt = `Analyze this pull request from a GitHub repository:

**PR #${prData.number}**: ${prData.title}
**Author**: ${prData.author.login}
**State**: ${prData.state}
**Created**: ${prData.createdAt}

**Description**:
${prData.body || "No description provided"}

**Statistics**:
- Additions: ${prData.additions}
- Deletions: ${prData.deletions}
- Files Changed: ${prData.changedFiles}
- Commits: ${prData.commits}

**Branches**: ${prData.head} → ${prData.base}

**Files Changed**:
${filesChanged}

**Code Changes** (showing up to 10 files with diffs):
${fileDiffs}

Provide a comprehensive code review including:
1. **Purpose**: What is this PR trying to achieve based on the actual changes?
2. **Code Review**: Detailed analysis of the code changes, patterns, and implementation
3. **Code Quality**: Assessment of coding standards, best practices, and maintainability
4. **Security Analysis**: Any security concerns in the specific code changes
5. **Performance**: Potential performance implications of the changes
6. **Testing**: Are the changes adequately covered? Any edge cases?
7. **Merge Readiness**: Is it ready to merge based on the code quality?
8. **Specific Suggestions**: Line-by-line or file-specific recommendations
9. **Potential Issues**: Bugs, edge cases, or risks in the actual code

Be thorough, specific, and reference actual code changes in your analysis.`;

    const result = await streamText({
      model: this.model,
      prompt,
    });

    return result;
  }

  // Streaming version for repository analysis
  async analyzeRepositoryStream(
    repoData: any,
    structure: any[],
    commits: any[],
    prs: any[],
  ) {
    const topFiles = structure
      .slice(0, 20)
      .map((f) => f.path)
      .join(", ");
    const recentCommits = commits
      .slice(0, 5)
      .map((c) => `- ${c.message.split("\n")[0]}`)
      .join("\n");

    const prompt = `Analyze this GitHub repository comprehensively:

**Repository**: ${repoData.fullName}
**Description**: ${repoData.description || "No description"}
**Language**: ${repoData.language}
**Stars**: ${repoData.stars} | **Forks**: ${repoData.forks}
**Created**: ${repoData.createdAt}

**Structure Overview** (${structure.length} total items):
${topFiles}

**Recent Commits**:
${recentCommits}

**Pull Requests**: ${prs.length} total

Provide a comprehensive analysis:
1. **Project Overview**: What is this project about?
2. **Architecture**: Code organization and structure
3. **Technology Stack**: Key technologies and frameworks used
4. **Development Activity**: Activity level and patterns
5. **Code Quality Indicators**: Overall code quality assessment
6. **Strengths**: What's done well
7. **Areas for Improvement**: Technical debt and recommendations
8. **Security**: Any security considerations

Be detailed but organized.`;

    const result = await streamText({
      model: this.model,
      prompt,
    });

    return result;
  }
}
