"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GitCommit,
  Sparkles,
  Loader2,
  Calendar,
  User,
  File,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCommits } from "./hooks/use-get-commits";
import { useCommitDetails } from "./hooks/use-get-commit-details";
import { useAnalyzeCommit } from "./hooks/use-get-analyze-commit";
import { CommitType } from "@/types/commit";

export default function CommitsPage() {
  const router = useRouter();
  const [selectedCommit, setSelectedCommit] = useState<any>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const { data: commits, isLoading } = useCommits();
  const { data: commitDetails } = useCommitDetails(selectedCommit?.sha);
  const { analyze, isStreaming, streamedContent, reset } = useAnalyzeCommit();

  useEffect(() => {
    const connection = sessionStorage.getItem("repoConnection");
    if (!connection) {
      router.push("/");
      return;
    }
  }, [router]);

  const handleCommitClick = (commit: any) => {
    setSelectedCommit(commit);
    setExpandedFiles(new Set());
    reset();
  };

  const toggleFile = (filename: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return newSet;
    });
  };

  const renderDiff = (patch: string) => {
    if (!patch) return null;

    const lines = patch.split("\n");
    return (
      <div className="font-mono text-xs overflow-x-auto">
        {lines.map((line, idx) => {
          let bgColor = "bg-black/20";
          let textColor = "text-gray-300";

          if (line.startsWith("+") && !line.startsWith("+++")) {
            bgColor = "bg-green-500/20";
            textColor = "text-green-300";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            bgColor = "bg-red-500/20";
            textColor = "text-red-300";
          } else if (line.startsWith("@@")) {
            bgColor = "bg-blue-500/20";
            textColor = "text-blue-300";
          }

          return (
            <div
              key={idx}
              className={`${bgColor} ${textColor} px-2 py-0.5 whitespace-pre`}
            >
              {line || " "}
            </div>
          );
        })}
      </div>
    );
  };

  const handleAnalyze = () => {
    if (!selectedCommit) return;
    analyze(selectedCommit.sha);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          <h1 className="text-3xl font-bold text-white flex items-center">
            <GitCommit className="w-8 h-8 mr-3 text-green-400" />
            Commit History
          </h1>
          <p className="text-gray-300">View and analyze commit history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commits List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">
              Recent Commits
            </h2>

            <div className="space-y-3 max-h-175 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                </div>
              ) : (
                commits?.map((commit: CommitType, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleCommitClick(commit)}
                    className={`w-full text-left p-4 rounded-lg transition-all border ${
                      selectedCommit?.sha === commit.sha
                        ? "bg-green-600 border-green-500 text-white"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-xs font-mono bg-black/30 px-2 py-1 rounded">
                        {commit.sha.substring(0, 7)}
                      </code>
                      <div className="text-xs opacity-70 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(commit.author.date)}
                      </div>
                    </div>
                    <p className="font-medium mb-2 line-clamp-2">
                      {commit.message}
                    </p>
                    <div className="flex items-center text-xs opacity-70">
                      <User className="w-3 h-3 mr-1" />
                      {commit.author.name}
                    </div>
                    {commit.stats && (
                      <div className="flex items-center mt-2 text-xs space-x-3">
                        <span className="text-green-400">
                          +{commit.stats.additions}
                        </span>
                        <span className="text-red-400">
                          -{commit.stats.deletions}
                        </span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Commit Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            {selectedCommit ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Commit Details
                  </h2>
                  <button
                    onClick={handleAnalyze}
                    disabled={isStreaming}
                    className="flex items-center px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    {isStreaming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </button>
                </div>

                {commitDetails && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">
                        Commit SHA
                      </div>
                      <code className="text-white bg-black/30 px-2 py-1 rounded text-sm">
                        {commitDetails.sha}
                      </code>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Message</div>
                      <p className="text-white">{commitDetails.message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Author</div>
                        <p className="text-white">
                          {commitDetails.author.name}
                        </p>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Date</div>
                        <p className="text-white">
                          {formatDate(commitDetails.author.date)}
                        </p>
                      </div>
                    </div>

                    {commitDetails.stats && (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">
                          Changes
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-400">
                            +{commitDetails.stats.additions} additions
                          </span>
                          <span className="text-red-400">
                            -{commitDetails.stats.deletions} deletions
                          </span>
                        </div>
                      </div>
                    )}

                    {commitDetails.files && commitDetails.files.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">
                          File Changes ({commitDetails.files.length})
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {commitDetails.files.map(
                            (file: any, index: number) => (
                              <div
                                key={index}
                                className="bg-black/20 rounded-lg border border-white/10 overflow-hidden"
                              >
                                <button
                                  onClick={() => toggleFile(file.filename)}
                                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                                >
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    {expandedFiles.has(file.filename) ? (
                                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    )}
                                    <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <span
                                      className="text-white text-sm truncate"
                                      title={file.filename}
                                    >
                                      {file.filename}
                                    </span>
                                    {file.status !== "modified" && (
                                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 flex-shrink-0">
                                        {file.status}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-3 text-xs flex-shrink-0 ml-2">
                                    <span className="text-green-400">
                                      +{file.additions}
                                    </span>
                                    <span className="text-red-400">
                                      -{file.deletions}
                                    </span>
                                  </div>
                                </button>
                                {expandedFiles.has(file.filename) &&
                                  file.patch && (
                                    <div className="border-t border-white/10 max-h-96 overflow-y-auto">
                                      {renderDiff(file.patch)}
                                    </div>
                                  )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Analysis */}
                {streamedContent && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                      AI Analysis
                    </h3>
                    <div className="bg-linear-to-br overflow-x-scroll from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-500/30 max-h-96 overflow-y-auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold text-white mb-2 mt-3">
                              {children}
                            </h2>
                          ),
                          p: ({ children }) => (
                            <p className="text-gray-200 mb-2">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside text-gray-200 mb-2 space-y-1">
                              {children}
                            </ul>
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
              </>
            ) : (
              <div className="text-center py-12">
                <GitCommit className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Select a commit to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
