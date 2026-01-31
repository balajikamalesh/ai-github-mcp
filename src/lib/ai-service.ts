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

  // file analysis
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

  // commit analysis
  async analyzeCommitStream(commitData: any) {
    const filesChanged =
      commitData.files
        ?.map((f: any) => `- ${f.filename} (+${f.additions}/-${f.deletions})`)
        .join("\n") || "No file details available";

    // Including actual code diffs for deeper analysis
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
}
