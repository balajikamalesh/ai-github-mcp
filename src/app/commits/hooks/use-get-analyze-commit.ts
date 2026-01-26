import { useStreamAnalysis } from "@/hooks/use-streaming-analysis";

export function useAnalyzeCommit() {
  const stream = useStreamAnalysis();
  
  const analyze = (sha: string) => {
    return stream.startStream('/api/analyze/commit', { sha });
  };

  return {
    ...stream,
    analyze,
  };
}