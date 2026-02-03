import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function usePullRequestDetails(number: number | null) {
  return useQuery({
    queryKey: ['pull-request', number],
    queryFn: async () => {
      if (!number) throw new Error('No PR number provided');
      
      const response = await apiClient.get(`/api/pull-requests/${number}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.pullRequest;
    },
    enabled: !!number,
  });
}