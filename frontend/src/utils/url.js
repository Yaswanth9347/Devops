export function shortenUrl(url, maxLength = 40) {
  if (!url) return "";
  return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
}

export function shortId(value, length = 8) {
  if (value === null || value === undefined) return "—";
  return String(value).substring(0, length);
}