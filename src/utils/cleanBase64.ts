/**
 * Remove data URLs metadata prefix from a base64 string to get the raw image bytes.
 */
export const cleanBase64 = (base64Str: string): string => {
  if (!base64Str) return "";
  return base64Str.replace(/^data:image\/\w+;base64,/, "");
};
