"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  File,
  Folder,
  FileCode,
  Sparkles,
  Loader2,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFiles } from "./hooks/use-get-files";
import { useFileContent } from "./hooks/use-get-file-content";
import { useAnalyzeFile } from "./hooks/use-analyze-file";
import { FileType } from "@/types/file";

export default function FilesPage() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");
  const [pathHistory, setPathHistory] = useState<string[]>([""]);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const { data: files, isLoading } = useFiles(currentPath);
  const { data: fileContent } = useFileContent(selectedFile?.path);
  const { analyze, isStreaming, streamedContent, reset } = useAnalyzeFile();

  useEffect(() => {
    const connection = sessionStorage.getItem("repoConnection");
    if (!connection) {
      router.push("/");
      return;
    }
  }, [router]);

  const handleFileClick = (file: any) => {
    if (file.type === "dir") {
      setPathHistory([...pathHistory, file.path]);
      setCurrentPath(file.path);
    } else {
      setSelectedFile(file);
      reset();
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    analyze(selectedFile.path);
  };

  const goBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      setPathHistory(newHistory);
      setCurrentPath(newHistory[newHistory.length - 1]);
    }
  };

  const getFileIcon = (file: FileType) => {
    if (file.type === "dir") {
      return <Folder className="w-5 h-5 text-yellow-400" />;
    }
    return <FileCode className="w-5 h-5 text-blue-400" />;
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
          <h1 className="text-3xl font-bold text-white">Repository Files</h1>
          <p className="text-gray-300">
            Browse and analyze files in your repository
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Browser */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Files</h2>
              {pathHistory.length > 1 && (
                <button
                  onClick={goBack}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  ← Go Back
                </button>
              )}
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-300 mb-4 overflow-x-auto">
              <span>Repository</span>
              {currentPath && (
                <>
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-white">{currentPath}</span>
                </>
              )}
            </div>

            {/* File List */}
            <div className="space-y-2 max-h-150 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                </div>
              ) : (
                files?.map((file: FileType, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleFileClick(file)}
                    className={`w-full flex items-center p-3 rounded-lg transition-all ${
                      selectedFile?.path === file.path
                        ? "bg-purple-600 text-white"
                        : "bg-white/5 hover:bg-white/10 text-gray-200"
                    }`}
                  >
                    {getFileIcon(file)}
                    <span className="ml-3 flex-1 text-left truncate">
                      {file.name}
                    </span>
                    {file.size && (
                      <span className="text-xs opacity-60 ml-2">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* File Viewer */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <File className="w-6 h-6 text-blue-400 mr-2" />
                    <h2 className="text-xl font-bold text-white truncate">
                      {selectedFile.name}
                    </h2>
                  </div>
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

                {/* File Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Content
                  </h3>
                  <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {fileContent || "Loading..."}
                    </pre>
                  </div>
                </div>

                {/* AI Analysis */}
                {streamedContent && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                      AI Analysis
                    </h3>
                    <div className="bg-linear-to-br overflow-x-scroll from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-500/30">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold text-white mb-3">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold text-white mb-2 mt-4">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-semibold text-white mb-2 mt-3">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-gray-200 mb-2">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside text-gray-200 mb-2 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside text-gray-200 mb-2 space-y-1">
                              {children}
                            </ol>
                          ),
                          code: ({ children }) => (
                            <code className="bg-black/30 px-1 py-0.5 rounded text-sm text-purple-300">
                              {children}
                            </code>
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
                <FileCode className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  Select a file to view and analyze
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
