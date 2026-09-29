import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode,
  FileText,
  FileJson,
  Image as ImageIcon,
  Zap,
  ExternalLink,
  Rss,
  Compass
} from 'lucide-react';
import { GeneratedFiles, BlogPostData, SupportedFileType } from '../types';
import { downloadSingleFile } from '../utils/folderZip';

interface CodeViewerProps {
  files: GeneratedFiles;
  post?: BlogPostData;
  activeFile: SupportedFileType;
  onSelectFile: (file: SupportedFileType) => void;
  onOpenOptimizer?: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  files,
  post,
  activeFile,
  onSelectFile,
  onOpenOptimizer
}) => {
  const [copied, setCopied] = useState(false);

  let currentContent = '';
  let currentMime = 'text/plain';

  switch (activeFile) {
    case 'index.html':
      currentContent = files.html;
      currentMime = 'text/html';
      break;
    case 'article.md':
      currentContent = files.markdown;
      currentMime = 'text/markdown';
      break;
    case 'schema.json':
      currentContent = JSON.stringify(files.schema, null, 2);
      currentMime = 'application/json';
      break;
    case 'metadata.json':
      currentContent = JSON.stringify(files.metadata, null, 2);
      currentMime = 'application/json';
      break;
    case 'sitemap.xml':
      currentContent = files.sitemapXml || '';
      currentMime = 'application/xml';
      break;
    case 'feed.xml':
      currentContent = files.rssXml || '';
      currentMime = 'application/rss+xml';
      break;
    case 'featured-image.webp':
      currentContent = post?.imageOptimization?.optimizedDataUrl || '';
      currentMime = 'image/webp';
      break;
  }

  const isImageFile = activeFile === 'featured-image.webp';
  const optInfo = post?.imageOptimization;

  const lineCount = currentContent.split('\n').length;
  const byteSize = isImageFile
    ? optInfo?.optimizedSizeBytes || 0
    : new Blob([currentContent]).size;
  const formattedSize =
    byteSize > 1024 * 1024
      ? `${(byteSize / (1024 * 1024)).toFixed(2)} MB`
      : byteSize > 1024
      ? `${(byteSize / 1024).toFixed(1)} KB`
      : `${byteSize} B`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (isImageFile && optInfo?.optimizedDataUrl) {
      const a = document.createElement('a');
      a.href = optInfo.optimizedDataUrl;
      a.download = optInfo.fileName || 'featured-image.webp';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      downloadSingleFile(activeFile, currentContent, currentMime);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* Tab Navigation Header */}
      <div className="px-4 py-2 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 bg-neutral-950/80">
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button
            onClick={() => onSelectFile('index.html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
              activeFile === 'index.html'
                ? 'bg-neutral-800 text-cyan-300 font-semibold border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>index.html</span>
          </button>

          <button
            onClick={() => onSelectFile('article.md')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
              activeFile === 'article.md'
                ? 'bg-neutral-800 text-emerald-300 font-semibold border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>article.md</span>
          </button>

          <button
            onClick={() => onSelectFile('schema.json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
              activeFile === 'schema.json'
                ? 'bg-neutral-800 text-amber-300 font-semibold border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>schema.json</span>
          </button>

          <button
            onClick={() => onSelectFile('metadata.json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
              activeFile === 'metadata.json'
                ? 'bg-neutral-800 text-purple-300 font-semibold border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-purple-400" />
            <span>metadata.json</span>
          </button>

          <button
            onClick={() => onSelectFile('sitemap.xml')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
              activeFile === 'sitemap.xml'
                ? 'bg-neutral-800 text-blue-300 font-semibold border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>sitemap.xml</span>
          </button>

          <button
            onClick={() => onSelectFile('feed.xml')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
              activeFile === 'feed.xml'
                ? 'bg-neutral-800 text-orange-300 font-semibold border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Rss className="w-3.5 h-3.5 text-orange-400" />
            <span>feed.xml</span>
          </button>

          <button
            onClick={() => onSelectFile('featured-image.webp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
              activeFile === 'featured-image.webp'
                ? 'bg-neutral-800 text-pink-300 font-semibold border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>featured-image.webp</span>
          </button>
        </div>

        {/* Actions & Metrics */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-neutral-400 hidden sm:block">
            {!isImageFile && <span>{lineCount} lines &middot; </span>}
            <span>{formattedSize}</span>
          </div>

          {!isImageFile && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-md transition-colors"
            title={`Download ${activeFile}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Code / Image Display Body */}
      <div className="flex-1 overflow-auto bg-neutral-950 p-4 font-mono text-xs text-neutral-200 leading-relaxed">
        {isImageFile ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 space-y-4">
            <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white font-mono">{optInfo?.fileName || 'featured-image.webp'}</span>
                {optInfo ? (
                  <span className="text-emerald-400 font-mono text-[11px]">-{optInfo.savingsPercent}% WebP Compressed</span>
                ) : (
                  <span className="text-neutral-400 font-mono text-[11px]">Original asset</span>
                )}
              </div>

              <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center max-h-72">
                <img
                  src={optInfo?.optimizedDataUrl || post?.image}
                  alt={post?.title || 'Preview'}
                  className="w-full h-auto object-cover max-h-72"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Dimensions:</span>
                  <span className="text-neutral-200 font-mono">{optInfo ? `${optInfo.width} × ${optInfo.height} px` : '1200 × 675 px (Est.)'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Optimized Size:</span>
                  <span className="text-cyan-400 font-mono">{formattedSize}</span>
                </div>
              </div>

              {onOpenOptimizer && (
                <div className="pt-2">
                  <button
                    onClick={onOpenOptimizer}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Re-optimize with Sharp (WebP / Quality)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <pre className="selection:bg-cyan-500/30 selection:text-white">
            <code>{currentContent}</code>
          </pre>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span>techstarz101.com</span>
          <span>&rsaquo;</span>
          <span className="text-neutral-200">{files.folderPath}</span>
          <span>&rsaquo;</span>
          <span className="text-cyan-400">{activeFile}</span>
        </div>
        <div>
          <span>Encoding: UTF-8</span>
          <span className="mx-2">&bull;</span>
          <span>Type: {currentMime}</span>
        </div>
      </div>
    </div>
  );
};
