import JSZip from 'jszip';

export type CanvasFormatId = 'status' | 'square' | 'vertical';

export interface CanvasFormatSpec {
  id: CanvasFormatId;
  width: number;
  height: number;
  ratioLabel: string;
}

export const CANVAS_FORMATS: Record<CanvasFormatId, CanvasFormatSpec> = {
  status: { id: 'status', width: 1080, height: 1920, ratioLabel: '9:16' },
  square: { id: 'square', width: 1080, height: 1080, ratioLabel: '1:1' },
  vertical: { id: 'vertical', width: 1080, height: 1350, ratioLabel: '4:5' },
};

export interface CanvasPalette {
  id: string;
  name: string;
  bgStart: string;
  bgEnd: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export const CANVAS_PALETTES: CanvasPalette[] = [
  {
    id: 'emerald',
    name: 'WhatsApp Emerald',
    bgStart: '#064E3B',
    bgEnd: '#059669',
    textColor: '#FFFFFF',
    mutedColor: '#D1FAE5',
    accentColor: '#34D399',
    badgeBg: 'rgba(255,255,255,0.16)',
    badgeText: '#FFFFFF',
  },
  {
    id: 'slate',
    name: 'Deep Slate',
    bgStart: '#0F172A',
    bgEnd: '#1E293B',
    textColor: '#F8FAFC',
    mutedColor: '#CBD5E1',
    accentColor: '#10B981',
    badgeBg: 'rgba(255,255,255,0.12)',
    badgeText: '#F8FAFC',
  },
  {
    id: 'paper',
    name: 'Crisp Paper',
    bgStart: '#FFFFFF',
    bgEnd: '#F1F5F9',
    textColor: '#0F172A',
    mutedColor: '#475569',
    accentColor: '#059669',
    badgeBg: '#E2E8F0',
    badgeText: '#0F172A',
  },
  {
    id: 'cobalt',
    name: 'Cobalt Studio',
    bgStart: '#1E3A8A',
    bgEnd: '#2563EB',
    textColor: '#FFFFFF',
    mutedColor: '#DBEAFE',
    accentColor: '#93C5FD',
    badgeBg: 'rgba(255,255,255,0.16)',
    badgeText: '#FFFFFF',
  },
  {
    id: 'sand',
    name: 'Warm Editorial',
    bgStart: '#F5F5F4',
    bgEnd: '#E7E5E4',
    textColor: '#1C1917',
    mutedColor: '#57534E',
    accentColor: '#047857',
    badgeBg: '#D6D3D1',
    badgeText: '#1C1917',
  },
  {
    id: 'pine',
    name: 'Forest Charcoal',
    bgStart: '#14532D',
    bgEnd: '#09090B',
    textColor: '#FAFAFA',
    mutedColor: '#D4D4D8',
    accentColor: '#4ADE80',
    badgeBg: 'rgba(255,255,255,0.14)',
    badgeText: '#FAFAFA',
  },
];

export interface SlideData {
  id: string;
  headline: string;
  body: string;
  footer: string;
  imageUrl: string | null;
}

export interface CanvasRenderOptions {
  format: CanvasFormatId;
  palette: CanvasPalette;
  align: 'left' | 'center';
  imageFit: 'cover' | 'contain';
  scrimOpacity: number; // 0..85
  fontScale: number; // 0.8..1.3
  showSlideBadge: boolean;
  showSafeZones: boolean;
  isRtl: boolean;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text.trim()) return [];
  const paragraphs = text.split('\n');
  const result: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push('');
      continue;
    }

    const hasSpaces = /\s/.test(para);
    if (hasSpaces) {
      const words = para.split(/\s+/);
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) result.push(currentLine);
          // Break single extra-long word character by character
          if (ctx.measureText(word).width > maxWidth) {
            let chunk = '';
            for (const ch of Array.from(word)) {
              if (ctx.measureText(chunk + ch).width > maxWidth && chunk) {
                result.push(chunk);
                chunk = ch;
              } else {
                chunk += ch;
              }
            }
            currentLine = chunk;
          } else {
            currentLine = word;
          }
        }
      }
      if (currentLine) result.push(currentLine);
    } else {
      // CJK or continuous text without spaces
      let currentLine = '';
      for (const ch of Array.from(para)) {
        if (ctx.measureText(currentLine + ch).width > maxWidth && currentLine) {
          result.push(currentLine);
          currentLine = ch;
        } else {
          currentLine += ch;
        }
      }
      if (currentLine) result.push(currentLine);
    }
  }

  return result;
}

export function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function renderSlideToCanvas(
  canvas: HTMLCanvasElement,
  slide: SlideData,
  slideIndex: number,
  totalSlides: number,
  options: CanvasRenderOptions
): Promise<void> {
  const spec = CANVAS_FORMATS[options.format];
  canvas.width = spec.width;
  canvas.height = spec.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = spec;
  const { palette } = options;

  // 1. Background gradient
  const grad = ctx.createLinearGradient(0, 0, width * 0.6, height);
  grad.addColorStop(0, palette.bgStart);
  grad.addColorStop(1, palette.bgEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle architectural grid lines when no image is uploaded
  if (!slide.imageUrl) {
    ctx.save();
    ctx.strokeStyle =
      palette.textColor === '#FFFFFF' || palette.textColor === '#F8FAFC' || palette.textColor === '#FAFAFA'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(15,23,42,0.04)';
    ctx.lineWidth = 2;
    const step = 120;
    for (let x = step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. Optional uploaded local image
  if (slide.imageUrl) {
    try {
      const img = await loadHtmlImage(slide.imageUrl);
      const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
      const canvasRatio = width / height;

      let drawW = width;
      let drawH = height;
      let drawX = 0;
      let drawY = 0;

      if (options.imageFit === 'cover') {
        if (imgRatio > canvasRatio) {
          drawH = height;
          drawW = height * imgRatio;
          drawX = (width - drawW) / 2;
        } else {
          drawW = width;
          drawH = width / imgRatio;
          drawY = (height - drawH) / 2;
        }
      } else {
        if (imgRatio > canvasRatio) {
          drawW = width;
          drawH = width / imgRatio;
          drawY = (height - drawH) / 2;
        } else {
          drawH = height;
          drawW = height * imgRatio;
          drawX = (width - drawW) / 2;
        }
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      if (options.scrimOpacity > 0) {
        const alpha = Math.min(0.85, Math.max(0, options.scrimOpacity / 100));
        const scrim = ctx.createLinearGradient(0, 0, 0, height);
        scrim.addColorStop(0, `rgba(15, 23, 42, ${(alpha * 0.55).toFixed(2)})`);
        scrim.addColorStop(0.5, `rgba(15, 23, 42, ${(alpha * 0.72).toFixed(2)})`);
        scrim.addColorStop(1, `rgba(15, 23, 42, ${Math.min(0.92, alpha * 0.95).toFixed(2)})`);
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, width, height);
      }
    } catch {
      // Ignore failed local image decode
    }
  }

  // Determine safe padding (Status 9:16 leaves extra room top/bottom for WhatsApp chrome)
  const sidePadding = 96;
  const topSafe = options.format === 'status' ? 240 : 108;
  const bottomSafe = options.format === 'status' ? 250 : 108;
  const contentWidth = width - sidePadding * 2;

  const hasDarkImageOverlay = Boolean(slide.imageUrl && options.scrimOpacity >= 25);
  const headlineFill = hasDarkImageOverlay ? '#FFFFFF' : palette.textColor;
  const bodyFill = hasDarkImageOverlay ? '#E2E8F0' : palette.mutedColor;
  const accentFill = hasDarkImageOverlay ? '#34D399' : palette.accentColor;

  ctx.save();
  ctx.direction = options.isRtl ? 'rtl' : 'ltr';
  const alignCenter = options.align === 'center';
  ctx.textAlign = alignCenter ? 'center' : options.isRtl ? 'right' : 'left';
  const anchorX = alignCenter ? width / 2 : options.isRtl ? width - sidePadding : sidePadding;

  // 4. Slide counter / top bar accent
  if (options.showSlideBadge) {
    const counterLabel = `${String(slideIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    ctx.font = `600 28px "JetBrains Mono", monospace`;
    const metrics = ctx.measureText(counterLabel);
    const pillW = metrics.width + 44;
    const pillH = 54;
    const pillX = alignCenter
      ? width / 2 - pillW / 2
      : options.isRtl
        ? width - sidePadding - pillW
        : sidePadding;
    const pillY = topSafe;

    ctx.fillStyle = hasDarkImageOverlay ? 'rgba(15,23,42,0.68)' : palette.badgeBg;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 12);
    ctx.fill();

    ctx.fillStyle = hasDarkImageOverlay ? '#FFFFFF' : palette.badgeText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(counterLabel, pillX + pillW / 2, pillY + pillH / 2 + 1);
    ctx.textAlign = alignCenter ? 'center' : options.isRtl ? 'right' : 'left';
  }

  // 5. Measure & position headline + body vertically centered within safe frame
  const headlineSize = Math.round(74 * options.fontScale);
  const headlineLineH = Math.round(headlineSize * 1.18);
  const bodySize = Math.round(40 * options.fontScale);
  const bodyLineH = Math.round(bodySize * 1.44);

  ctx.font = `800 ${headlineSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
  const headlineLines = wrapTextLines(ctx, slide.headline, contentWidth);

  ctx.font = `500 ${bodySize}px "Inter", sans-serif`;
  const bodyLines = wrapTextLines(ctx, slide.body, contentWidth);

  const totalTextHeight =
    headlineLines.length * headlineLineH +
    (headlineLines.length > 0 && bodyLines.length > 0 ? 36 : 0) +
    bodyLines.length * bodyLineH;

  const availableTop = topSafe + (options.showSlideBadge ? 92 : 20);
  const availableBottom = height - bottomSafe - 80;
  const availableMid = (availableTop + availableBottom) / 2;
  let cursorY = Math.max(availableTop, availableMid - totalTextHeight / 2);

  // Accent bar above headline
  if (headlineLines.length > 0 || bodyLines.length > 0) {
    const barW = 84;
    const barH = 8;
    const barX = alignCenter
      ? width / 2 - barW / 2
      : options.isRtl
        ? width - sidePadding - barW
        : sidePadding;
    ctx.fillStyle = accentFill;
    ctx.beginPath();
    ctx.roundRect(barX, cursorY - 28, barW, barH, 4);
    ctx.fill();
  }

  // Draw headline
  ctx.fillStyle = headlineFill;
  ctx.textBaseline = 'top';
  ctx.font = `800 ${headlineSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
  for (const line of headlineLines) {
    ctx.fillText(line, anchorX, cursorY);
    cursorY += headlineLineH;
  }

  if (headlineLines.length > 0 && bodyLines.length > 0) {
    cursorY += 32;
  }

  // Draw body
  ctx.fillStyle = bodyFill;
  ctx.font = `500 ${bodySize}px "Inter", sans-serif`;
  for (const line of bodyLines) {
    ctx.fillText(line, anchorX, cursorY);
    cursorY += bodyLineH;
  }

  // 6. Footer / Brand Handle
  if (slide.footer.trim()) {
    ctx.fillStyle = hasDarkImageOverlay ? '#CBD5E1' : palette.mutedColor;
    ctx.font = `600 30px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(slide.footer.trim(), anchorX, height - bottomSafe);
  }

  ctx.restore();

  // 7. Safe-zone preview guides (only drawn during preview, never when exporting)
  if (options.showSafeZones) {
    ctx.save();
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.72)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(
      sidePadding / 2,
      topSafe - 24,
      width - sidePadding,
      height - (topSafe - 24) - (bottomSafe - 24)
    );

    if (options.format === 'status') {
      ctx.fillStyle = 'rgba(37, 99, 235, 0.14)';
      ctx.fillRect(0, 0, width, topSafe - 24);
      ctx.fillRect(0, height - (bottomSafe - 24), width, bottomSafe - 24);
    }
    ctx.restore();
  }
}

export async function exportCanvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate PNG blob'));
      },
      'image/png',
      1.0
    );
  });
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSlidesAsZip(
  slides: SlideData[],
  options: Omit<CanvasRenderOptions, 'showSafeZones'>
): Promise<void> {
  const zip = new JSZip();
  const offscreen = document.createElement('canvas');
  const spec = CANVAS_FORMATS[options.format];

  for (let idx = 0; idx < slides.length; idx += 1) {
    await renderSlideToCanvas(offscreen, slides[idx], idx, slides.length, {
      ...options,
      showSafeZones: false,
    });
    const blob = await exportCanvasToBlob(offscreen);
    const num = String(idx + 1).padStart(2, '0');
    zip.file(`whatscue-slide-${num}-${spec.width}x${spec.height}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerBlobDownload(zipBlob, `whatscue-${options.format}-${spec.width}x${spec.height}.zip`);
}
