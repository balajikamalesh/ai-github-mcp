export const apiClient = {
  async fetch(url: string, options: RequestInit = {}) {
    const connection = sessionStorage.getItem('repoConnection');
    
    // incluede repository connection in headers of every request
    const headers = new Headers(options.headers);
    if (connection && connection !== 'undefined' && connection !== 'null') {
      headers.set('x-repo-connection', connection);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  },

  async get(url: string) {
    return this.fetch(url, { method: 'GET' });
  },

  async post(url: string, data?: any) {
    return this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async stream(url: string, data?: any, onChunk?: (chunk: string) => void) {
    const response = await this.post(url, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Stream request failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response body');
    }

    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      
      if (onChunk) {
        onChunk(chunk);
      }
    }

    return fullText;
  },
};