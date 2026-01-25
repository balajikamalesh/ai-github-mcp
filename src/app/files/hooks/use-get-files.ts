import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useFiles(path: string) {
  return useQuery({
    queryKey: ['files', path],
    queryFn: async () => {
      const response = await apiClient.get(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.files;
    },
    enabled: typeof window !== 'undefined' && !!sessionStorage.getItem('repoConnection'),
  });
}