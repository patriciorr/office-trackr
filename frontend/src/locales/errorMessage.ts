const errorKeys: Readonly<Record<string, string>> = {
  AUTH001: "user_not_found",
  AUTH002: "invalid_credentials",
  FN001: "first_name_required",
  FN002: "first_name_length",
  FN003: "first_name_format",
  LN001: "last_name_required",
  LN002: "last_name_length",
  LN003: "last_name_format",
  EM001: "email_required",
  EM002: "email_format",
  EM003: "email_registered",
  PW001: "password_required",
  PW002: "password_strength",
  PW003: "password_common",
  PW004: "password_all_required",
  PW005: "password_mismatch",
  PW006: "user_not_found",
  PW007: "old_password_incorrect",
  PW008: "direct_password_failed",
};

class NetworkError extends Error {}

export async function fetchWithNetworkError(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new NetworkError();
  }
}

export function errorMessageKey(error: unknown, fallback: string): string {
  if (error instanceof NetworkError) return "network_error";
  if (error instanceof Error) {
    const code = error.message.match(/\b(?:AUTH|FN|LN|EM|PW)\d{3}\b/)?.[0];
    if (code && errorKeys[code]) return errorKeys[code];
  }
  return fallback;
}
