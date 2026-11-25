interface AdSlotProps {
  slotId: string;
  placementLabel: string;
  minHeightPx?: number;
}

export function AdSlot({ slotId, placementLabel, minHeightPx = 100 }: AdSlotProps) {
  return (
    <aside
      aria-label={placementLabel}
      className="no-print w-full"
    >
      {/* Media.net Ad Unit Container: Insert your Media.net mntag / ad-tag script target inside this slotId wrapper.
          Reserved min-height prevents Cumulative Layout Shift (CLS) and never overlaps the editor or preview. */}
      <div
        id={slotId}
        data-ad-provider="media-net"
        style={{ minHeight: `${minHeightPx}px` }}
        className="flex w-full items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-white/70 px-4 py-3 text-center"
      >
        <div className="text-xs text-slate-400">
          <span>{placementLabel}</span>
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          <span className="font-mono">{slotId}</span>
        </div>
      </div>
    </aside>
  );
}
