type FullscreenDocumentElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export async function requestDocumentFullscreen(): Promise<void> {
  try {
    const docEl = document.documentElement as FullscreenDocumentElement;
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
      return;
    }

    docEl.webkitRequestFullscreen?.();
  } catch {
    // Ignore browser-specific fullscreen failures.
  }
}
