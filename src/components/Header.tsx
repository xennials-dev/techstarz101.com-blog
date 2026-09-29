import React from 'react';
import { Download, Sparkles, FolderArchive, Plus, Users } from 'lucide-react';
import { TechstarzLogo } from './TechstarzLogo';

interface HeaderProps {
  activeTab: 'scraper' | 'preview' | 'files' | 'audit';
  setActiveTab: (tab: 'scraper' | 'preview' | 'files' | 'audit') => void;
  onDownloadAllZip: () => void;
  onNewScrapeClick: () => void;
  onOpenAuthors: () => void;
  postCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadAllZip,
  onNewScrapeClick,
  onOpenAuthors,
  postCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text/logo element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); setActiveTab('scraper'); }}
            className="focus:outline-none flex items-center"
            title="techstarz101.com Blog Engine"
          >
            <TechstarzLogo size="sm" showDomain={true} />
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('scraper')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'scraper'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Ingest &amp; Scraper
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'preview'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Live Page Preview
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'files'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Folder Structure ({postCount})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'audit'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            SEO &amp; Schema Audit
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAuthors}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-md transition-colors"
            title="View Authors & Profiles"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Authors</span>
          </button>
          <button
            onClick={onNewScrapeClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-700 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Post</span>
          </button>
          <button
            onClick={onDownloadAllZip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors font-semibold shadow-sm"
            title="Download complete /blog directory as .ZIP"
          >
            <FolderArchive className="w-3.5 h-3.5 text-neutral-950" />
            <span>Export /blog ZIP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
