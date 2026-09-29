import React, { useState } from 'react';
import { X, Layers, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

interface BatchScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunBatch: (urls: string[]) => Promise<void>;
  isProcessing: boolean;
}

export const BatchScraperModal: React.FC<BatchScraperModalProps> = ({
  isOpen,
  onClose,
  onRunBatch,
  isProcessing
}) => {
  if (!isOpen) return null;

  const [urlListText, setUrlListText] = useState(
    `https://news.ycombinator.com/item?id=39120401\nhttps://dev.to/t/webdev\nhttps://techcrunch.com/category/artificial-intelligence/`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = urlListText
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.startsWith('http://') || u.startsWith('https://'));

    if (urls.length > 0) {
      onRunBatch(urls);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Batch Scraper Pipeline</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-neutral-300">
            Paste target blog URLs (one per line). The scraper will automatically extract the content, format each post into the techstarz101.com template, and create separate <code className="text-cyan-400">/blog/[post-slug]/</code> folders.
          </p>

          <textarea
            rows={5}
            value={urlListText}
            onChange={(e) => setUrlListText(e.target.value)}
            disabled={isProcessing}
            placeholder="https://...\nhttps://..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 font-mono focus:outline-none focus:border-cyan-500"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Crawling &amp; Populating...</span>
                </>
              ) : (
                <>
                  <span>Queue Batch Scrape</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
