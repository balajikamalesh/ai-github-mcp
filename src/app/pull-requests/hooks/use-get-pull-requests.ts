import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function usePullRequests(state: 'all' | 'open' | 'closed' = 'all') {
  return useQuery({
    queryKey: ['pull-requests', state],
    queryFn: async () => {
      const response = await apiClient.get(`/api/pull-requests?state=${state}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.pullRequests;
    },
    enabled: typeof window !== 'undefined' && !!sessionStorage.getItem('repoConnection'),
  });
}