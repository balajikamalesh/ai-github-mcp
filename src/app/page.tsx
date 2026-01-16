"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Github,
  Sparkles,
  FileCode,
  GitCommit,
  GitPullRequest,
  Search,
} from "lucide-react";
import { useConnect } from "@/hooks/use-connect";

export default function Home() {
  const router = useRouter();
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");

  const connectMutation = useConnect();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    connectMutation.mutate(
      { owner, repo, token },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br ">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Github className="size-12 text-purple-400 mr-4" />
            <Sparkles className="size-12 text-yellow-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">
            GitHub Repository Analyzer
          </h3>
          <p className="text-md text-gray-300 max-w-2xl mx-auto">
            AI-powered insights for your GitHub repositories. Analyze code,
            commits, pull requests, and more with Model Context Protocol.
          </p>
        </div>

        <div className="flex justify-center gap-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex gap-4 items-center bg-white/10 rounded-xl p-4 border border-white/20">
            <FileCode className="w-10 h-10 text-blue-400" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                File Analysis
              </h3>
              <p className="text-gray-300">
                Deep dive into any file with AI-powered code review
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center bg-white/10 rounded-xl p-4 border border-white/20">
            <GitCommit className="w-10 h-10 text-green-400" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Commit Insights
              </h3>
              <p className="text-gray-300">
                Understand the impact and quality of every commit
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center bg-white/10 rounded-xl p-4 border border-white/20">
            <GitPullRequest className="w-10 h-10 text-purple-400" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                PR Reviews
              </h3>
              <p className="text-gray-300">
                Automated pull request analysis and suggestions
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center bg-white/10 rounded-xl p-4 border border-white/20">
            <Search className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Chat Interface
              </h3>
              <p className="text-gray-300">
                Ask questions about your repository naturally
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              Connect to a Repository
            </h2>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Repository Owner
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g., facebook"
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g., react"
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  GitHub Token <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-gray-400 text-xs mt-2">
                  <strong className="text-yellow-400">⚠️ Required:</strong>{" "}
                  Without a token, you'll hit GitHub's rate limit (60
                  requests/hour). With a token, you get 5,000 requests/hour.{" "}
                </p>
              </div>

              {connectMutation.error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
                  {connectMutation.error.message}
                </div>
              )}

              <button
                type="submit"
                disabled={connectMutation.isPending}
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {connectMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5 mr-2" />
                    Connect & Analyze
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
