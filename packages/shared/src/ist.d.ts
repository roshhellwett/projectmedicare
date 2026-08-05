export declare const IST_TIMEZONE: "Asia/Kolkata";
export declare function formatCampDate(value: string | Date): string;
export declare function formatShortDate(value: string | Date): string;
export declare function formatDateTime(value: string | Date): string;
export declare function istToday(): string;
export declare function nextSundayIST(): string;
export type BulletinWindowStatus = "live" | "scheduled" | "expired";
export declare function windowStatus(
  startsAt: string | null,
  endsAt: string | null,
  now?: Date,
): BulletinWindowStatus;
