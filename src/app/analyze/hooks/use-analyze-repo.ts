import { useStreamAnalysis } from "@/hooks/use-streaming-analysis";

export function useAnalyzeRepo() {
  const stream = useStreamAnalysis();
  
  const analyze = () => {
    return stream.startStream('/api/analyze/repo');
  };

  return {
    ...stream,
    analyze,
  };
}