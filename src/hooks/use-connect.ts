import { useMutation } from "@tanstack/react-query";

interface ConnectParams {
  owner: string;
  repo: string;
  token: string;
}

export function useConnect() {
  return useMutation({
    mutationFn: async (params: ConnectParams) => {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect");
      }

      return data;
    },
    onSuccess: (response) => {
      // Store connection credentials in session
      if (response.connection) {
        sessionStorage.setItem("repoConnection", JSON.stringify(response.connection));
      }
    },
  });
}
