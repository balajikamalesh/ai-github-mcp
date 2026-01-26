import { useStreamAnalysis } from "@/hooks/use-streaming-analysis";

export function useAnalyzePR() {
  const stream = useStreamAnalysis();
  
  const analyze = (number: number) => {
    return stream.startStream('/api/analyze/pr', { number });
  };

  return {
    ...stream,
    analyze,
  };
}