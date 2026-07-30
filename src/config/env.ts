function required(
  name: string,
  value: string | undefined,
): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  apiUrl: required(
    "VITE_API_URL",
    import.meta.env.VITE_API_URL,
  ),
  mode: import.meta.env.MODE,

  isDev: import.meta.env.DEV,

  isProd: import.meta.env.PROD,
} as const;