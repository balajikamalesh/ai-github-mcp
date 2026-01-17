import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useGetRepoInfo() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const connection = sessionStorage.getItem('repoConnection');
      if (!connection) {
        throw new Error('No repository connection');
      }

      const response = await apiClient.get('/api/repo-info');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    enabled: typeof window !== 'undefined' && !!sessionStorage.getItem('repoConnection'),
  });
}