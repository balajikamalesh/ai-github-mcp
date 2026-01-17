"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Github,
  Star,
  GitFork,
  FileCode,
  GitCommit,
  GitPullRequest,
  MessageSquare,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";
import { useGetRepoInfo } from "./hooks/use-repo-info";

export default function Dashboard() {
  const router = useRouter();
  const { data, isLoading, error } = useGetRepoInfo();

  useEffect(() => {
    const connection = sessionStorage.getItem("repoConnection");
    if (!connection) {
      router.push("/");
    }
  }, [router]);

  const handleDisconnect = () => {
    sessionStorage.removeItem("repoConnection");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { repo: repoInfo, stats } = data;

  return (
    <div className="min-h-screen bg-linear-to-br ">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Github className="w-12 h-12 text-purple-400 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {repoInfo?.fullName}
                </h1>
                <p className="text-gray-300">
                  {repoInfo?.description || "No description"}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Disconnect
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-white">
                {repoInfo?.stars?.toLocaleString()} stars
              </span>
            </div>
            <div className="flex items-center">
              <GitFork className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-white">
                {repoInfo?.forks?.toLocaleString()} forks
              </span>
            </div>
            <div className="flex items-center">
              <FileCode className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white">{repoInfo?.language}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-white">
                {stats?.contributors} contributors
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/chat">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500 transition-all cursor-pointer group">
              <MessageSquare className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Chat with AI
              </h3>
              <p className="text-gray-300">
                Ask questions about your repository
              </p>
            </div>
          </Link>

          <Link href="/files">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500 transition-all cursor-pointer group">
              <FileCode className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Browse Files
              </h3>
              <p className="text-gray-300">
                Analyze and explore repository files
              </p>
            </div>
          </Link>

          <Link href="/commits">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-green-500 transition-all cursor-pointer group">
              <GitCommit className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Commits
              </h3>
              <p className="text-gray-300">View and analyze commit history</p>
            </div>
          </Link>

          <Link href="/pull-requests">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-yellow-500 transition-all cursor-pointer group">
              <GitPullRequest className="w-12 h-12 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Pull Requests
              </h3>
              <p className="text-gray-300">Review and analyze pull requests</p>
            </div>
          </Link>

          <Link href="/analyze">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-red-500 transition-all cursor-pointer group">
              <BarChart3 className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Full Analysis
              </h3>
              <p className="text-gray-300">Comprehensive repository analysis</p>
            </div>
          </Link>

          <div className="bg-linear-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/50">
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Total Files</span>
                <span className="text-white font-semibold">
                  {stats?.totalFiles}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Recent Commits</span>
                <span className="text-white font-semibold">
                  {stats?.recentCommits}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Open PRs</span>
                <span className="text-white font-semibold">
                  {stats?.openPRs}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {stats?.recentActivity?.map((activity: any, index: number) => (
              <div
                key={index}
                className="flex items-start p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="shrink-0 mr-4">
                  {activity.type === "commit" && (
                    <GitCommit className="w-6 h-6 text-green-400" />
                  )}
                  {activity.type === "pr" && (
                    <GitPullRequest className="w-6 h-6 text-purple-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.message}</p>
                  <p className="text-gray-400 text-sm">
                    {activity.author} • {activity.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
