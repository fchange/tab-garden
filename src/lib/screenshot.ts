import html2canvas from 'html2canvas';

const SCREENSHOT_FONT_FALLBACK =
  '"PingFang SC", "PingFang TC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

function useLocalScreenshotFonts(): () => void {
  const style = document.documentElement.style;
  const properties = ['--font-family-ornament-1', '--font-family-ornament-2'];
  const previousValues = properties.map((property) => ({
    property,
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
  }));

  properties.forEach((property) => {
    style.setProperty(property, SCREENSHOT_FONT_FALLBACK, 'important');
  });

  return () => {
    previousValues.forEach(({ property, value, priority }) => {
      if (value) {
        style.setProperty(property, value, priority);
      } else {
        style.removeProperty(property);
      }
    });
  };
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Failed to encode the page screenshot.'));
    }, 'image/png');
  });
}

export async function copyPageScreenshot(): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Image clipboard access is unavailable.');
  }

  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Page root is unavailable.');
  }

  const restoreFonts = useLocalScreenshotFonts();
  const screenshot = html2canvas(root, {
      backgroundColor: null,
      width: window.innerWidth,
      height: window.innerHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      scale: Math.min(window.devicePixelRatio, 2),
      useCORS: true,
      logging: false,
      ignoreElements: (element) => element.hasAttribute('data-screenshot-exclude'),
    })
    .then(canvasToPngBlob);

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': screenshot }),
    ]);
  } finally {
    await screenshot.catch(() => undefined);
    restoreFonts();
  }
}
