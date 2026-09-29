import React, { useState } from 'react';
import { X, Zap, Loader2, Check, ArrowRight, Download, Sliders, Image as ImageIcon } from 'lucide-react';
import { BlogPostData, ImageOptimizationInfo } from '../types';

interface ImageOptimizerModalProps {
  post: BlogPostData;
  isOpen: boolean;
  onClose: () => void;
  onApplyOptimization: (info: ImageOptimizationInfo) => void;
}

export const ImageOptimizerModal: React.FC<ImageOptimizerModalProps> = ({
  post,
  isOpen,
  onClose,
  onApplyOptimization
}) => {
  if (!isOpen) return null;

  const currentOpt = post.imageOptimization;
  const [maxWidth, setMaxWidth] = useState<number>(currentOpt?.width || 1200);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<'webp' | 'jpeg' | 'png'>((currentOpt?.format as any) || 'webp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<ImageOptimizationInfo | null>(currentOpt || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleRunOptimization = async () => {
    if (!post.image) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/optimize-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: post.image,
          maxWidth,
          quality,
          format
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to optimize image');
      }

      const data = await res.json();
      setPreviewResult(data);
    } catch (e: any) {
      setErrorMsg(e.message || 'Optimization request failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (previewResult) {
      onApplyOptimization(previewResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Automated Image Optimizer</h2>
              <p className="text-xs text-neutral-400">Resize, strip EXIF metadata, and convert to next-gen WebP.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-neutral-300">
          {/* Controls Bar */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-850 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compression &amp; Sizing Parameters</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Target: {maxWidth}px &bull; {quality}% Quality &bull; {format.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Max Width */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Max Width (px)</label>
                <select
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value={800}>800px (Mobile-first)</option>
                  <option value={1200}>1200px (Standard Hero)</option>
                  <option value={1600}>1600px (Ultra HD 2x)</option>
                </select>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Quality Level ({quality}%)</label>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-cyan-400 mt-2"
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Target Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="webp">WebP (Recommended)</option>
                  <option value="jpeg">MozJPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleRunOptimization}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing with Sharp...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Optimization</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Results Comparison */}
          {previewResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
                  <div className="text-neutral-400 text-[10px] uppercase">Original Size</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {formatBytes(previewResult.originalSizeBytes)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
                  <div className="text-neutral-400 text-[10px] uppercase">Optimized WebP</div>
                  <div className="text-sm font-bold text-cyan-300 mt-1">
                    {formatBytes(previewResult.optimizedSizeBytes)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
                  <div className="text-neutral-400 text-[10px] uppercase">Bandwidth Saved</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    -{previewResult.savingsPercent}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
                  <div className="text-neutral-400 text-[10px] uppercase">Dimensions</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {previewResult.width} &times; {previewResult.height}
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-neutral-400">
                    Preview: {previewResult.fileName}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    Saved into /blog/{post.slug}/featured-image.webp
                  </span>
                </div>
                <div className="rounded overflow-hidden max-h-56 bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <img
                    src={previewResult.optimizedDataUrl || post.image}
                    alt={post.title}
                    className="w-full h-auto object-cover max-h-56"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400">
            Improves Core Web Vitals (Largest Contentful Paint &amp; Page Weight)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!previewResult}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Blog Folder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
