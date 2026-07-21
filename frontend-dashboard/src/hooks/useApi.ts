import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: HeadersInit;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const request = useCallback(async <T = any>(endpoint: string, options?: UseApiOptions): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      // VITE_API_URL dari .env (contoh: http://localhost:4000/api)
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      };

      if (userEmail) {
        headers['x-user-email'] = userEmail;
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Hapus Content-Type jika mengirim FormData agar browser bisa set boundary secara otomatis
      if (options?.body instanceof FormData) {
        delete (headers as Record<string, string>)['Content-Type'];
      }

      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      const fetchOptions: RequestInit = {
        method: options?.method || 'GET',
        headers,
      };

      if (options?.body) {
        fetchOptions.body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);
      }

      const res = await fetch(url, fetchOptions);

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        throw new Error('Unauthorized');
      }

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return (await res.text()) as any;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return { request, loading, error };
}
