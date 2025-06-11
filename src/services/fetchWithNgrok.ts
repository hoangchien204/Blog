// src/services/fetchWithNgrok.ts

export async function fetchWithNgrokWarning(url: string, options: RequestInit = {}) {
  const newOptions: RequestInit = {
    ...options,
    headers: {
      ...(options.headers || {}),
      'ngrok-skip-browser-warning': 'true',
    },
  };
  return fetch(url, newOptions);
}
