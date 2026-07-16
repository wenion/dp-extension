// shared/types/content-script.ts

export const InjectionResult = {
  Success: 1,
  UnsupportedUrl: -1,
  NoPermission: -2,
  InjectionFailed: -3,
  ContentUnavailable: -4,
} as const;

export type InjectionResult =
  typeof InjectionResult[keyof typeof InjectionResult];
