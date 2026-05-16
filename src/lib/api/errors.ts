/**
 * Sanitises database errors before sending to the client.
 * Never expose raw Postgres error messages, codes, or stack traces.
 */

interface DbError {
  code?: string;
  message?: string;
}

const FRIENDLY: Record<string, string> = {
  "23505": "This record already exists.",
  "23503": "A related record was not found.",
  "23502": "A required field is missing.",
  "42501": "You do not have permission to do this.",
  "PGRST116": "Record not found.",
};

export function friendlyError(error: DbError | null | undefined, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;
  if (error.code && FRIENDLY[error.code]) return FRIENDLY[error.code];
  return fallback;
}
