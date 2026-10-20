import type { InterceptorConfig } from "@/shared/interceptor";

export const chatGPTInterceptorConfig: InterceptorConfig = {
  methods: ["POST"],
  urls: ["/conversation"],
};
