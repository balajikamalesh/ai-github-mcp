"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAnalyzeRepo } from "./hooks/use-analyze-repo";

export default function AnalyzePage() {
  const router = useRouter();
  const { analyze, isStreaming, streamedContent } = useAnalyzeRepo();

  useEffect(() => {
    const connection = sessionStorage.getItem("repoConnection");
    if (!connection) {
      router.push("/");
    }
  }, [router]);

  const hasAnalyzed = streamedContent.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br ">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <Link href="/dashboard">
            <button className="flex items-center text-white hover:text-purple-300 transition-colors mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-red-400" />
                Full Repository Analysis
              </h1>
              <p className="text-gray-300">
                Comprehensive AI-powered analysis of the entire repository
              </p>
            </div>
            {!hasAnalyzed && (
              <button
                onClick={analyze}
                disabled={isStreaming}
                className="flex items-center px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 text-lg font-semibold"
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    Start Analysis
                  </>
                )}
              </button>
            )}
          </div>
          <div className="h-8"></div>
          <div className="flex items-center justify-between gap-2">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-purple-400 font-semibold mb-2">
                📁 Project Structure
              </div>
              <div className="text-gray-300 text-sm">
                Code organization, file structure, and architecture patterns
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-blue-400 font-semibold mb-2">
                🛠️ Technology Stack
              </div>
              <div className="text-gray-300 text-sm">
                Languages, frameworks, and dependencies used
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-green-400 font-semibold mb-2">
                📊 Development Activity
              </div>
              <div className="text-gray-300 text-sm">
                Commit patterns, contributor activity, and development trends
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-yellow-400 font-semibold mb-2">
                ✨ Code Quality
              </div>
              <div className="text-gray-300 text-sm">
                Best practices, potential improvements, and recommendations
              </div>
            </div>
          </div>
        </div>

        {streamedContent && hasAnalyzed && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Sparkles className="w-7 h-7 text-yellow-400 mr-3" />
                Analysis Results
              </h2>
              <button
                onClick={analyze}
                disabled={isStreaming}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Re-analyze
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-white mb-4 mt-6 pb-2 border-b border-white/20">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-white mb-3 mt-5">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-white mb-2 mt-4">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-200 mb-3 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-200 mb-3 space-y-2 ml-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-200 mb-3 space-y-2 ml-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-black/40 px-2 py-1 rounded text-sm text-purple-300 font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto my-3 border border-white/10">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 my-3 text-gray-300 italic">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">
                      {children}
                    </strong>
                  ),
                }}
              >
                {streamedContent}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
