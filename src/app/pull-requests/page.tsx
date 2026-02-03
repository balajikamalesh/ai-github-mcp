"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GitPullRequest,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  File,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePullRequests } from "./hooks/use-get-pull-requests";
import { usePullRequestDetails } from "./hooks/use-get-pull-request-details";
import { useAnalyzePR } from "./hooks/use-analyze-pull-request";
import { PullRequestType } from "@/types/pull-request";

export default function PullRequestsPage() {
  const router = useRouter();
  const [selectedPR, setSelectedPR] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const { data: prs, isLoading } = usePullRequests(filter);
  const { data: prDetails } = usePullRequestDetails(selectedPR?.number);
  const { analyze, isStreaming, streamedContent, reset } = useAnalyzePR();

  useEffect(() => {
    const connection = sessionStorage.getItem("repoConnection");
    if (!connection) {
      router.push("/");
      return;
    }
  }, [router]);

  const handlePRClick = (pr: any) => {
    setSelectedPR(pr);
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
    if (!selectedPR) return;
    analyze(selectedPR.number);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <GitPullRequest className="w-8 h-8 mr-3 text-yellow-400" />
                Pull Requests
              </h1>
              <p className="text-gray-300">Review and analyze pull requests</p>
            </div>

            {/* Filter */}
            <div className="flex space-x-2">
              {(["all", "open", "closed"] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => setFilter(state)}
                  className={`px-4 py-2 rounded-lg transition-all capitalize ${
                    filter === state
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PR List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">
              {filter.charAt(0).toUpperCase() + filter.slice(1)} Pull Requests
            </h2>

            <div className="space-y-3 max-h-175 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                </div>
              ) : !prs || prs.length === 0 ? (
                <div className="text-center py-8">
                  <GitPullRequest className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">
                    No {filter} pull requests found
                  </p>
                </div>
              ) : (
                prs.map((pr: PullRequestType, index: number) => (
                  <button
                    key={index}
                    onClick={() => handlePRClick(pr)}
                    className={`w-full text-left p-4 rounded-lg transition-all border ${
                      selectedPR?.number === pr.number
                        ? "bg-yellow-600 border-yellow-500 text-white"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {pr.state === "open" ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        ) : (
                          <XCircle className="w-5 h-5 text-purple-400 mr-2" />
                        )}
                        <span className="font-mono text-sm">#{pr.number}</span>
                      </div>
                      <span className="text-xs opacity-70">
                        {formatDate(pr.createdAt)}
                      </span>
                    </div>
                    <p className="font-medium mb-2 line-clamp-2">{pr.title}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="opacity-70">{pr.author.login}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">+{pr.additions}</span>
                        <span className="text-red-400">-{pr.deletions}</span>
                        <span className="opacity-70">
                          {pr.changedFiles} files
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* PR Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            {selectedPR ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">PR Details</h2>
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

                {prDetails && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          #{prDetails.number}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            prDetails.state === "open"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {prDetails.state}
                        </span>
                      </div>
                      <p className="text-white text-lg">{prDetails.title}</p>
                    </div>

                    {prDetails.body && (
                      <div>
                        <div className="text-sm text-gray-400 mb-1">
                          Description
                        </div>
                        <div className="bg-black/20 rounded-lg p-3 text-gray-200 text-sm max-h-32 overflow-y-auto">
                          {prDetails.body}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Author</div>
                        <p className="text-white">{prDetails.author.login}</p>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">
                          Created
                        </div>
                        <p className="text-white">
                          {formatDate(prDetails.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-2">Branches</div>
                      <div className="flex items-center text-sm">
                        <code className="bg-black/30 px-2 py-1 rounded text-blue-300">
                          {prDetails.head}
                        </code>
                        <span className="mx-2 text-gray-400">→</span>
                        <code className="bg-black/30 px-2 py-1 rounded text-green-300">
                          {prDetails.base}
                        </code>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-black/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          +{prDetails.additions}
                        </div>
                        <div className="text-xs text-gray-400">Additions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">
                          -{prDetails.deletions}
                        </div>
                        <div className="text-xs text-gray-400">Deletions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {prDetails.changedFiles}
                        </div>
                        <div className="text-xs text-gray-400">Files</div>
                      </div>
                    </div>

                    {prDetails.files && prDetails.files.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">
                          File Changes ({prDetails.files.length})
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {prDetails.files.map((file: any, index: number) => (
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
                          ))}
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
                <GitPullRequest className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  Select a pull request to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
