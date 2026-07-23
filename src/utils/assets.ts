export function getPublicAssetUrl(path: string) {
  const baseUrl = import.meta.env?.BASE_URL ?? '/';
  return `${baseUrl}${path.replace(/^\/+/, '')}`;
}
