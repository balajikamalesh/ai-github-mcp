import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useCommits() {
  return useQuery({
    queryKey: ['commits'],
    queryFn: async () => {
      const response = await apiClient.get('/api/commits');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.commits;
    },
    enabled: typeof window !== 'undefined' && !!sessionStorage.getItem('repoConnection'),
  });
}
