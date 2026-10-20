import type { InterceptorConfig } from "@/shared/interceptor";

export const claudeInterceptorConfig: InterceptorConfig = {
  methods: ["POST"],
  urls: ["/completion"],
};
