export declare class ValidationError extends Error {}
export declare function str(
  value: unknown,
  field: string,
  opts?: { min?: number; max?: number; optional?: boolean },
): string;
export declare function num(
  value: unknown,
  field: string,
  opts?: { min?: number; max?: number },
): number;
export declare function bool(value: unknown): boolean;
export declare function dateOnly(value: unknown, field: string): string;
export declare function isoOrNull(value: unknown, field: string): string | null;
export declare function oneOf<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): T;
export declare function uuid(value: unknown, field: string): string;
