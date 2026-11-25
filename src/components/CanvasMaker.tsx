import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  Archive,
  Download,
  Eye,
  ImagePlus,
  Trash2,
} from 'lucide-react';
import type { LocaleBundle } from '../i18n/types';
import {
  CANVAS_FORMATS,
  CANVAS_PALETTES,
  type CanvasFormatId,
  exportCanvasToBlob,
  exportSlidesAsZip,
  renderSlideToCanvas,
  type SlideData,
  triggerBlobDownload,
} from '../utils/canvasRenderer';

interface CanvasMakerProps {
  locale: LocaleBundle;
  isRtl: boolean;
}

function createInitialSlides(locale: LocaleBundle): SlideData[] {
  return Array.from({ length: 8 }, (_, idx) => ({
    id: `slide-${idx + 1}`,
    headline: idx === 0 ? locale.canvasMaker.defaultHeadline : `${locale.canvasMaker.defaultHeadline} #${idx + 1}`,
    body: locale.canvasMaker.defaultBody,
    footer: locale.canvasMaker.defaultFooter,
    imageUrl: null,
  }));
}

export function CanvasMaker({ locale, isRtl }: CanvasMakerProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [format, setFormat] = useState<CanvasFormatId>('status');
  const [slideCount, setSlideCount] = useState<number>(3);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [slides, setSlides] = useState<SlideData[]>(() => createInitialSlides(locale));

  const [paletteId, setPaletteId] = useState<string>(CANVAS_PALETTES[0].id);
  const [align, setAlign] = useState<'left' | 'center'>('left');
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [scrimOpacity, setScrimOpacity] = useState<number>(52);
  const [fontScale, setFontScale] = useState<number>(1.0);
  const [showSlideBadge, setShowSlideBadge] = useState<boolean>(true);
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);

  const activePalette =
    CANVAS_PALETTES.find((p) => p.id === paletteId) ?? CANVAS_PALETTES[0];
  const visibleSlides = slides.slice(0, slideCount);
  const safeActiveIndex = Math.min(activeSlideIndex, slideCount - 1);
  const currentSlide = visibleSlides[safeActiveIndex] ?? slides[0];
  const spec = CANVAS_FORMATS[format];

  // Re-render live preview canvas whenever any visual property changes
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !currentSlide) return;

    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await renderSlideToCanvas(canvas, currentSlide, safeActiveIndex, slideCount, {
        format,
        palette: activePalette,
        align,
        imageFit,
        scrimOpacity,
        fontScale,
        showSlideBadge,
        showSafeZones,
        isRtl,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [
    activePalette,
    align,
    currentSlide,
    fontScale,
    format,
    imageFit,
    isRtl,
    safeActiveIndex,
    scrimOpacity,
    showSafeZones,
    showSlideBadge,
    slideCount,
  ]);

  const updateCurrentSlide = (patch: Partial<SlideData>) => {
    setSlides((prev) =>
      prev.map((slide, idx) => (idx === safeActiveIndex ? { ...slide, ...patch } : slide))
    );
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFiles = Array.from(files).slice(0, 8 - safeActiveIndex);

    selectedFiles.forEach((file, offset) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const targetIdx = safeActiveIndex + offset;
          setSlides((prev) =>
            prev.map((slide, idx) =>
              idx === targetIdx ? { ...slide, imageUrl: reader.result as string } : slide
            )
          );
          if (targetIdx >= slideCount) {
            setSlideCount(Math.min(8, targetIdx + 1));
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadSingle = async () => {
    if (!currentSlide) return;
    const offscreen = document.createElement('canvas');
    await renderSlideToCanvas(offscreen, currentSlide, safeActiveIndex, slideCount, {
      format,
      palette: activePalette,
      align,
      imageFit,
      scrimOpacity,
      fontScale,
      showSlideBadge,
      showSafeZones: false,
      isRtl,
    });
    const blob = await exportCanvasToBlob(offscreen);
    const num = String(safeActiveIndex + 1).padStart(2, '0');
    triggerBlobDownload(blob, `whatscue-slide-${num}-${spec.width}x${spec.height}.png`);
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      await exportSlidesAsZip(visibleSlides, {
        format,
        palette: activePalette,
        align,
        imageFit,
        scrimOpacity,
        fontScale,
        showSlideBadge,
        isRtl,
      });
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            {locale.canvasMaker.heading}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{locale.canvasMaker.subheading}</p>
        </div>
        <div className="font-mono text-xs font-medium text-slate-500 tabular-nums">
          {spec.width} × {spec.height} px · {spec.ratioLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-5">
          {/* Format & Slide Count */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                {locale.canvasMaker.formatLabel}
              </span>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                {(['status', 'square', 'vertical'] as CanvasFormatId[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`min-h-[40px] rounded-lg border px-2.5 py-2 text-xs font-semibold whitespace-nowrap truncate transition-colors ${
                      format === fmt
                        ? 'border-[#059669] bg-emerald-50 text-[#047857]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {locale.canvasMaker.formats[fmt]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="canvas-slide-count"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {locale.canvasMaker.slideCountLabel}:{' '}
                <span className="font-mono tabular-nums text-[#059669]">{slideCount}</span>
              </label>
              <input
                id="canvas-slide-count"
                type="range"
                min={1}
                max={8}
                step={1}
                value={slideCount}
                onChange={(e) => {
                  const nextCount = Number(e.target.value);
                  setSlideCount(nextCount);
                  if (activeSlideIndex >= nextCount) {
                    setActiveSlideIndex(nextCount - 1);
                  }
                }}
                className="mt-2 w-full accent-[#059669]"
              />
            </div>
          </div>

          {/* Slide Selector Strip */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
            <span className="block text-xs font-semibold text-slate-700">
              {locale.canvasMaker.activeSlideLabel}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`min-h-[38px] min-w-[46px] rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold tabular-nums transition-colors ${
                    idx === safeActiveIndex
                      ? 'border-[#059669] bg-[#059669] text-white'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Slide Text Inputs */}
          <div className="space-y-3.5 border-t border-[#E2E8F0] pt-4">
            <div>
              <label
                htmlFor="canvas-headline"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {locale.canvasMaker.headlineLabel}
              </label>
              <input
                id="canvas-headline"
                type="text"
                value={currentSlide.headline}
                onChange={(e) => updateCurrentSlide({ headline: e.target.value })}
                placeholder={locale.canvasMaker.headlinePlaceholder}
                className="w-full min-h-[42px] rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              />
            </div>

            <div>
              <label
                htmlFor="canvas-body"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {locale.canvasMaker.bodyLabel}
              </label>
              <textarea
                id="canvas-body"
                rows={3}
                value={currentSlide.body}
                onChange={(e) => updateCurrentSlide({ body: e.target.value })}
                placeholder={locale.canvasMaker.bodyPlaceholder}
                className="w-full resize-y rounded-lg border border-[#E2E8F0] bg-white p-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              />
            </div>

            <div>
              <label
                htmlFor="canvas-footer"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {locale.canvasMaker.footerLabel}
              </label>
              <input
                id="canvas-footer"
                type="text"
                value={currentSlide.footer}
                onChange={(e) => updateCurrentSlide({ footer: e.target.value })}
                placeholder={locale.canvasMaker.footerPlaceholder}
                className="w-full min-h-[40px] rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              />
            </div>
          </div>

          {/* Palettes & Local Image Upload */}
          <div className="space-y-4 border-t border-[#E2E8F0] pt-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                {locale.canvasMaker.paletteLabel}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {CANVAS_PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaletteId(p.id)}
                    aria-label={p.name}
                    title={p.name}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      paletteId === p.id
                        ? 'border-[#059669] bg-emerald-50 text-slate-900'
                        : 'border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-sm border border-black/10 shrink-0"
                      style={{ background: `linear-gradient(135deg, ${p.bgStart}, ${p.bgEnd})` }}
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-slate-300 bg-[#F8FAFC] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    {locale.canvasMaker.uploadLabel}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{locale.canvasMaker.uploadHint}</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="sr-only"
                    id="canvas-image-upload"
                  />
                  <label
                    htmlFor="canvas-image-upload"
                    className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 whitespace-nowrap hover:bg-slate-50"
                  >
                    <ImagePlus className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                    <span>{locale.canvasMaker.uploadLabel}</span>
                  </label>
                  {currentSlide.imageUrl && (
                    <button
                      type="button"
                      onClick={() => updateCurrentSlide({ imageUrl: null })}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-red-600 whitespace-nowrap hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{locale.canvasMaker.clearImageBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Layout & Visual Fine-Tuning */}
          <div className="grid grid-cols-1 gap-4 border-t border-[#E2E8F0] pt-4 sm:grid-cols-2">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                {locale.canvasMaker.alignLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAlign('left')}
                  className={`flex-1 min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    align === 'left'
                      ? 'border-[#059669] bg-emerald-50 text-[#047857]'
                      : 'border-[#E2E8F0] bg-white text-slate-700'
                  }`}
                >
                  <AlignLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{locale.canvasMaker.alignLeft}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlign('center')}
                  className={`flex-1 min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    align === 'center'
                      ? 'border-[#059669] bg-emerald-50 text-[#047857]'
                      : 'border-[#E2E8F0] bg-white text-slate-700'
                  }`}
                >
                  <AlignCenter className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{locale.canvasMaker.alignCenter}</span>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="canvas-font-scale"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {locale.canvasMaker.fontScaleLabel}:{' '}
                <span className="font-mono tabular-nums">{Math.round(fontScale * 100)}%</span>
              </label>
              <input
                id="canvas-font-scale"
                type="range"
                min={0.8}
                max={1.25}
                step={0.05}
                value={fontScale}
                onChange={(e) => setFontScale(Number(e.target.value))}
                className="mt-2 w-full accent-[#059669]"
              />
            </div>

            {currentSlide.imageUrl && (
              <>
                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {locale.canvasMaker.imageFitLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setImageFit('cover')}
                      className={`flex-1 min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        imageFit === 'cover'
                          ? 'border-[#059669] bg-emerald-50 text-[#047857]'
                          : 'border-[#E2E8F0] bg-white text-slate-700'
                      }`}
                    >
                      {locale.canvasMaker.fitCover}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageFit('contain')}
                      className={`flex-1 min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        imageFit === 'contain'
                          ? 'border-[#059669] bg-emerald-50 text-[#047857]'
                          : 'border-[#E2E8F0] bg-white text-slate-700'
                      }`}
                    >
                      {locale.canvasMaker.fitContain}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="canvas-scrim"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {locale.canvasMaker.scrimLabel}:{' '}
                    <span className="font-mono tabular-nums">{scrimOpacity}%</span>
                  </label>
                  <input
                    id="canvas-scrim"
                    type="range"
                    min={0}
                    max={80}
                    step={5}
                    value={scrimOpacity}
                    onChange={(e) => setScrimOpacity(Number(e.target.value))}
                    className="mt-2 w-full accent-[#059669]"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-5 border-t border-[#E2E8F0] pt-4 text-xs font-medium text-slate-700">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSlideBadge}
                onChange={(e) => setShowSlideBadge(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#059669] focus:ring-[#059669]"
              />
              <span>{locale.canvasMaker.showSlideBadgeLabel}</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSafeZones}
                onChange={(e) => setShowSafeZones(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                {locale.canvasMaker.safeZoneLabel}
              </span>
            </label>
          </div>
        </div>

        {/* Live Canvas Preview & Export Column */}
        <div className="lg:col-span-5 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-slate-900">
              {locale.canvasMaker.previewLabel}
            </h3>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {String(safeActiveIndex + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
            </span>
          </div>

          <div className="flex justify-center rounded-lg border border-[#E2E8F0] bg-slate-100 p-4">
            <canvas
              ref={previewCanvasRef}
              className="max-h-[470px] w-auto max-w-full rounded-md shadow-sm"
            />
          </div>

          {showSafeZones && (
            <p className="text-xs text-[#2563EB]">{locale.canvasMaker.safeZoneNote}</p>
          )}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleDownloadSingle}
              className="flex-1 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#059669] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-[#047857] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>{locale.canvasMaker.downloadSingleBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="flex-1 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-blue-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              <span>
                {isExportingZip
                  ? locale.canvasMaker.zippingBtn
                  : locale.canvasMaker.downloadZipBtn}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
