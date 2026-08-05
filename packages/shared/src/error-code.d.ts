export declare const SUPPORT_EMAIL: "zenithprojects@icloud.com";
export declare function makeErrorCode(eventId?: string | null): string;
export declare function isErrorCode(value: unknown): boolean;
export declare function formatErrorReport(input: {
  code: string;
  path?: string | null;
  digest?: string | null;
  message?: string | null;
  at?: Date;
}): string;
export declare function supportMailto(report: string, code?: string): string;
