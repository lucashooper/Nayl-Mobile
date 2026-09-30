/**
 * One prefix for every decision that can let a user past the hard paywall, so a
 * Metro or Xcode console can be filtered with "[Paywall]". Logged in release too.
 */
export function paywallLog(event: string, details?: Record<string, unknown>): void {
  if (details) {
    console.log(`[Paywall] ${event}`, JSON.stringify(details));
  } else {
    console.log(`[Paywall] ${event}`);
  }
}

export function describeError(error: unknown): Record<string, unknown> {
  const e = error as { code?: unknown; message?: unknown; underlyingErrorMessage?: unknown; userCancelled?: unknown };
  return {
    code: e?.code ?? null,
    message: e?.message ?? String(error),
    underlying: e?.underlyingErrorMessage ?? null,
    userCancelled: e?.userCancelled ?? false,
  };
}
