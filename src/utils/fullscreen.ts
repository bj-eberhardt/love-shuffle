type FullscreenDocumentElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function shouldUseFullscreenOnThisDevice(): boolean {
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const isTabletOrMobileWidth = window.innerWidth <= 1024;

  return hasTouchPoints && (isCoarsePointer || isTabletOrMobileWidth);
}

export async function requestDocumentFullscreen(): Promise<void> {
  if (!shouldUseFullscreenOnThisDevice()) return;

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
