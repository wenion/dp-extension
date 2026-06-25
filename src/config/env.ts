export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  homepage: import.meta.env.VITE_HOMEPAGE,

  mode: import.meta.env.MODE,

  isDev: import.meta.env.DEV,

  isProd: import.meta.env.PROD,
} as const;