import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, Sparkles, Layers, Upload, Check, Clipboard, Maximize2, Minimize2, ArrowLeftRight } from 'lucide-react';

interface DualImageCanvasProps {
  preChartUrl: string;
  postChartUrl: string;
  onUpdateChart: (slot: 'pre' | 'post', imageUrl: string) => void;
  ticker?: string;
  setupName?: string;
}

export const DualImageCanvas: React.FC<DualImageCanvasProps> = ({
  preChartUrl,
  postChartUrl,
  onUpdateChart,
  ticker = 'NQ',
  setupName = 'Liquidity Sweep & FVG',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'blend'>('slider');
  const [blendOpacity, setBlendOpacity] = useState<number>(0.5);
  const [activePasteSlot, setActivePasteSlot] = useState<'pre' | 'post'>('pre');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Client-Side Canvas WebP Compression
  const compressToWebP = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No canvas context');
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/webp', 0.88);
          resolve(dataUrl);
        };
      };
      reader.onerror = (e) => reject(e);
    });
  }, []);

  // Global Clipboard Capture (Ctrl/Cmd + V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (!file) continue;

          try {
            setIsCompressing(true);
            const compressedUrl = await compressToWebP(file);
            onUpdateChart(activePasteSlot, compressedUrl);
            triggerToast(`Pasted chart into ${activePasteSlot === 'pre' ? 'Act I (Pre-Trade)' : 'Act III (Post-Trade)'}`);
          } catch (err) {
            console.error('Failed to process image paste:', err);
          } finally {
            setIsCompressing(false);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activePasteSlot, compressToWebP, onUpdateChart]);

  // Pointer drag calculations
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    },
    [isDragging]
  );

  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedUrl = await compressToWebP(file);
      onUpdateChart(activePasteSlot, compressedUrl);
      triggerToast(`Uploaded image to ${activePasteSlot === 'pre' ? 'Act I' : 'Act III'}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-3 w-full select-none ${isFullscreen ? 'fixed inset-0 z-50 bg-obsidian-base p-6 overflow-y-auto' : ''}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleManualUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Canvas Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-obsidian-surface border border-obsidian-highlight px-4 py-2.5 rounded-xl">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              viewMode === 'slider'
                ? 'bg-obsidian-highlight text-trade-emerald border border-trade-emerald/40 font-semibold'
                : 'text-obsidian-slate hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" /> Curtain Slider
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-obsidian-highlight text-trade-emerald border border-trade-emerald/40 font-semibold'
                : 'text-obsidian-slate hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Split 50/50
          </button>
          <button
            onClick={() => setViewMode('blend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              viewMode === 'blend'
                ? 'bg-obsidian-highlight text-trade-emerald border border-trade-emerald/40 font-semibold'
                : 'text-obsidian-slate hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Blend Overlay
          </button>
        </div>

        {/* Center: Active Clipboard Target Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-obsidian-slate font-mono">
            <Clipboard className="w-3.5 h-3.5 text-trade-emerald" />
            <span>Target (Ctrl+V):</span>
          </div>
          <div className="inline-flex rounded-lg border border-obsidian-border p-0.5 bg-obsidian-base">
            <button
              onClick={() => setActivePasteSlot('pre')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                activePasteSlot === 'pre'
                  ? 'bg-trade-emerald text-obsidian-base font-bold shadow-sm'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              Act I (Pre)
            </button>
            <button
              onClick={() => setActivePasteSlot('post')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                activePasteSlot === 'post'
                  ? 'bg-trade-emerald text-obsidian-base font-bold shadow-sm'
                  : 'text-obsidian-slate hover:text-white'
              }`}
            >
              Act III (Post)
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-obsidian-slate hover:text-white hover:bg-obsidian-highlight border border-obsidian-border rounded-lg text-xs transition-colors"
            title="Upload image file from computer"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 text-obsidian-slate hover:text-white hover:bg-obsidian-highlight rounded-lg transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="bg-trade-emerald text-obsidian-base px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 shadow-lg animate-fade-in w-fit self-center">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
        className="relative w-full aspect-[16/9] min-h-[420px] bg-obsidian-base border border-obsidian-border rounded-2xl overflow-hidden shadow-2xl transition-all"
      >
        {/* Loading Overlay */}
        {isCompressing && (
          <div className="absolute inset-0 z-50 bg-obsidian-base/85 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-3 text-trade-emerald font-mono text-sm">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-trade-emerald border-t-transparent" />
              Compressing & Ingesting WebP Chart...
            </div>
          </div>
        )}

        {/* View Mode 1: Curtain Comparison Slider */}
        {viewMode === 'slider' && (
          <>
            {/* Post-Trade Outcome Chart (Base Layer) */}
            <div className="absolute inset-0 w-full h-full select-none">
              <img
                src={postChartUrl}
                alt="Post-Trade Outcome"
                className="w-full h-full object-contain pointer-events-none"
              />
              <div className="absolute bottom-4 right-4 bg-obsidian-surface/90 backdrop-blur-md border border-obsidian-highlight px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-trade-crimson flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-trade-crimson" />
                ACT III: OUTCOME & EXECUTION PATH
              </div>
            </div>

            {/* Pre-Trade Thesis Chart (Clipped Foreground Layer) */}
            <div
              className="absolute inset-0 w-full h-full select-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            >
              <img
                src={preChartUrl}
                alt="Pre-Trade Setup"
                className="w-full h-full object-contain pointer-events-none"
              />
              <div className="absolute bottom-4 left-4 bg-obsidian-surface/90 backdrop-blur-md border border-obsidian-highlight px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-trade-emerald flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-trade-emerald" />
                ACT I: THESIS & STRUCTURAL LEVELS
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              style={{ left: `${sliderPosition}%` }}
              className="absolute top-0 bottom-0 w-1 bg-trade-emerald cursor-ew-resize z-30 shadow-[0_0_15px_rgba(16,185,129,0.9)] transition-shadow"
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-obsidian-elevated border-2 border-trade-emerald flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-4 h-4 text-trade-emerald" />
              </div>
            </div>
          </>
        )}

        {/* View Mode 2: Side-by-Side Split Screen */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-2 w-full h-full divide-x divide-obsidian-border select-none">
            {/* Left: Pre-Trade */}
            <div className="relative w-full h-full bg-obsidian-base">
              <img
                src={preChartUrl}
                alt="Pre-Trade Setup"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 left-3 bg-obsidian-surface/90 border border-obsidian-highlight px-2.5 py-1 rounded-md text-[11px] font-mono text-trade-emerald font-bold">
                ACT I: THESIS
              </div>
            </div>
            {/* Right: Post-Trade */}
            <div className="relative w-full h-full bg-obsidian-base">
              <img
                src={postChartUrl}
                alt="Post-Trade Outcome"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 right-3 bg-obsidian-surface/90 border border-obsidian-highlight px-2.5 py-1 rounded-md text-[11px] font-mono text-trade-crimson font-bold">
                ACT III: OUTCOME
              </div>
            </div>
          </div>
        )}

        {/* View Mode 3: Blend Overlay */}
        {viewMode === 'blend' && (
          <div className="relative w-full h-full select-none">
            {/* Base: Post-Trade */}
            <img
              src={postChartUrl}
              alt="Post-Trade Outcome"
              className="w-full h-full object-contain absolute inset-0"
            />
            {/* Overlay: Pre-Trade with variable opacity */}
            <img
              src={preChartUrl}
              alt="Pre-Trade Thesis"
              style={{ opacity: blendOpacity }}
              className="w-full h-full object-contain absolute inset-0 mix-blend-screen"
            />
            {/* Floating Opacity Slider */}
            <div className="absolute top-4 right-4 bg-obsidian-surface/95 border border-obsidian-highlight px-3 py-2 rounded-xl flex items-center gap-2 shadow-2xl">
              <span className="text-xs font-mono text-obsidian-slate">Thesis Opacity:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={blendOpacity}
                onChange={(e) => setBlendOpacity(parseFloat(e.target.value))}
                className="w-28 accent-trade-emerald cursor-pointer"
              />
              <span className="text-xs font-mono text-white w-8 text-right">
                {Math.round(blendOpacity * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Quick Tip Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-obsidian-slate px-2">
        <div className="flex items-center gap-2">
          <span className="text-trade-emerald">● TIP:</span>
          <span>Copy any chart snippet in TradingView and press <kbd className="bg-obsidian-surface px-1.5 py-0.5 rounded border border-obsidian-highlight text-white">Ctrl + V</kbd> to replace instantly.</span>
        </div>
        <div className="text-obsidian-slate/70">
          Slider position: <span className="text-white">{Math.round(sliderPosition)}%</span>
        </div>
      </div>
    </div>
  );
};
