"use client";

import { apiClient } from "@/lib/api-client";
import { useState } from "react";

export function useStreamAnalysis() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startStream = async (url: string, data?: any) => {
    setIsStreaming(true);
    setStreamedContent("");
    setError(null);

    try {
      await apiClient.stream(url, data, (chunk) => {
        setStreamedContent((prev) => prev + chunk);
      });
    } catch (err: any) {
      setError(err.message);
      setStreamedContent(`Error: ${err.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const reset = () => {
    setStreamedContent("");
    setError(null);
    setIsStreaming(false);
  };

  return {
    startStream,
    isStreaming,
    streamedContent,
    error,
    reset,
  };
}
