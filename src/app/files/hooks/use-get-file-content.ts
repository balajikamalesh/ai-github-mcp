import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useFileContent(filePath: string | null) {
  return useQuery({
    queryKey: ['file-content', filePath],
    queryFn: async () => {
      if (!filePath) throw new Error('No file path provided');
      
      const response = await apiClient.get(`/api/files/content?path=${encodeURIComponent(filePath)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.content;
    },
    enabled: !!filePath,
  });
}