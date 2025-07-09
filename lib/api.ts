const API_BASE = '';

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  static async getPosts() {
    return this.request<any>('/api/posts');
  }

  static async getUser(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }

  static async createPost(content: string, image?: string) {
    return this.request<any>('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content, image }),
    });
  }

  static async likePost(postId: string) {
    return this.request<any>(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  static async getComments(postId: string) {
    return this.request<any>(`/api/posts/${postId}/comments`);
  }
}