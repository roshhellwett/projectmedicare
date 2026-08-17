"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Mail, RefreshCw, Home } from "lucide-react";
import {
  SUPPORT_EMAIL,
  makeErrorCode,
  formatErrorReport,
  supportMailto,
} from "@jm/shared/error-code";

/**
 * The one screen every unexpected failure lands on. It must work even when the
 * rest of the app is broken, so it depends on nothing but React + shared utils.
 */
export default function ErrorScreen({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => makeErrorCode(error?.digest), [error?.digest]);

  const report = useMemo(
    () =>
      formatErrorReport({
        code,
        path: typeof window === "undefined" ? null : window.location.pathname,
        digest: error?.digest ?? null,
        message: error?.message ?? null,
      }),
    [code, error?.digest, error?.message],
  );

  useEffect(() => {
    console.error(`[${code}]`, error);
  }, [code, error]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="card w-full max-w-xl">
        <h1 className="text-2xl leading-snug md:text-3xl">
          Sorry Something Got Broken
        </h1>
        <p className="section-sub mt-3">
          This page could not load. Nothing you entered was lost. Please copy
          the error code below and email it to us — we will fix it and reply to
          you.
        </p>

        <div className="mt-6 rounded-md border border-line bg-surface-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-soft">
            Error code
          </p>
          <p className="mt-1 font-mono text-base break-all text-primary-deep">
            {code}
          </p>
          <button
            type="button"
            onClick={copy}
            className="btn btn-outline btn-sm mt-3"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy error details"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={supportMailto(report, code)}
            className="btn btn-primary btn-sm"
          >
            <Mail className="h-4 w-4" />
            Email {SUPPORT_EMAIL}
          </a>
          {reset && (
            <button
              type="button"
              onClick={reset}
              className="btn btn-outline btn-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          )}
          {/* Full reload on purpose: the router itself may be what broke. */}
          <button
            type="button"
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            onClick={() => window.location.assign("/en")}
            className="btn btn-outline btn-sm"
          >
            <Home className="h-4 w-4" />
            Back to home
          </button>
        </div>

        <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
          You can also call us on +91 62907 45327 during shop hours.
        </p>
      </div>
    </div>
  );
}
