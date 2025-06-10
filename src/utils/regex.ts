// Regular expression pattern for validating UUID version 4 format
// Format: 8 hex digits - 4 hex digits - 4 hex digits (starting with 4) - 4 hex digits (first digit 8-B) - 12 hex digits
export const UUID_V4_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
