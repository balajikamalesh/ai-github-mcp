import { useStreamAnalysis } from "@/hooks/use-streaming-analysis";

export function useAnalyzeFile() {
  const stream = useStreamAnalysis();
  
  const analyze = (path: string) => {
    return stream.startStream('/api/analyze/file', { path });
  };

  return {
    ...stream,
    analyze,
  };
}