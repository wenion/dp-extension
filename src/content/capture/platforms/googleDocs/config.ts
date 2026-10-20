import type { InterceptorConfig } from "@/shared/interceptor";

export const googleDocsInterceptorConfig: InterceptorConfig = {
  methods: ["POST"],
  urls: ["/save", "/assistwriting"],
};
