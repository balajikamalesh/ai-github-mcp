import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useCommitDetails(sha: string | null) {
  return useQuery({
    queryKey: ['commit', sha],
    queryFn: async () => {
      if (!sha) throw new Error('No SHA provided');
      
      const response = await apiClient.get(`/api/commits/${sha}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.commit;
    },
    enabled: !!sha,
  });
}