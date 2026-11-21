export function powerpointEmbedUrl(value: string | null | undefined): string | null {
  if (!value || value.length > 4096) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    const path = url.pathname.toLowerCase();
    if (url.hostname === 'onedrive.live.com' && (path === '/embed' || path.startsWith('/embed/'))) return url.href;
    if (url.hostname.endsWith('.sharepoint.com') && path.endsWith('/_layouts/15/doc.aspx') &&
        url.searchParams.get('action')?.toLowerCase() === 'embedview') return url.href;
    return null;
  } catch {
    return null;
  }
}
