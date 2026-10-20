function required(
  name: string,
  value: string | undefined,
): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function requiredScript(
  name: string,
  value: string | undefined,
): string {
  const scripts = required(name, value)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (scripts.length !== 1) {
    throw new Error(`${name} must contain exactly one script`);
  }

  return scripts[0];
}

export const env = {
  apiUrl: required(
    "VITE_API_URL",
    import.meta.env.VITE_API_URL,
  ),

  xhrInterceptorScript: requiredScript(
    "XHR_INTERCEPTOR_RESOURCES",
    import.meta.env.XHR_INTERCEPTOR_RESOURCES,
  ),

  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
