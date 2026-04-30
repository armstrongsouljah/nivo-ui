/**
 * Extracts a human-readable message from a Django REST Framework error response.
 *
 * Common DRF error shapes handled:
 *   { "detail": "Not found." }
 *   { "detail": { "detail": "..." } }
 *   { "email": ["A user with this email already exists."] }
 *   { "non_field_errors": ["Invalid credentials."] }
 *   HTML (Django debug page) → generic message
 */
export function parseDjangoError(text: string, status: number): string {
  if (!text) return `Something went wrong (${status}).`;

  // Django debug HTML — never expose to users
  if (text.trimStart().startsWith("<")) {
    return `Something went wrong. Please try again (${status}).`;
  }

  try {
    const data = JSON.parse(text) as Record<string, unknown>;

    // { "detail": "..." }
    if (typeof data.detail === "string") return data.detail;

    // { "detail": { "detail": "..." } }
    if (data.detail && typeof (data.detail as Record<string, unknown>).detail === "string") {
      return (data.detail as Record<string, unknown>).detail as string;
    }

    // { "non_field_errors": ["..."] }
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return String(data.non_field_errors[0]);
    }

    // { "field": ["error msg"] } — first field's first message
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (typeof value === "string") return value;
    }
  } catch {
    // Not JSON — return as-is if it looks like plain text, else generic
    if (text.length < 200) return text;
  }

  return `Something went wrong. Please try again (${status}).`;
}
