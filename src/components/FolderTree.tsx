import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Image as ImageIcon,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  FolderArchive,
  Tag,
  Rss,
  Compass
} from 'lucide-react';
import { ScrapedPostItem, SupportedFileType } from '../types';
import { downloadPostFolderZip } from '../utils/folderZip';

interface FolderTreeProps {
  posts: ScrapedPostItem[];
  selectedPostId: string;
  onSelectPost: (id: string) => void;
  onSelectFile: (file: SupportedFileType) => void;
  onUpdateSlug: (id: string, newSlug: string) => void;
  onDeletePost: (id: string) => void;
  onDownloadAllZip: () => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  posts,
  selectedPostId,
  onSelectPost,
  onSelectFile,
  onUpdateSlug,
  onDeletePost,
  onDownloadAllZip
}) => {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [slugDraft, setSlugDraft] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    ...posts.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
  });

  const toggleFolder = (key: string) => {
    setExpandedFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartEditSlug = (p: ScrapedPostItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPostId(p.id);
    setSlugDraft(p.data.slug);
  };

  const handleSaveSlug = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slugDraft.trim()) {
      onUpdateSlug(id, slugDraft.trim());
    }
    setEditingPostId(null);
  };

  const handleCancelSlug = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPostId(null);
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Directory Title Bar */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-neutral-200">Populated File Hierarchy</span>
          <span className="text-[11px] font-mono text-neutral-400">
            ({posts.length} {posts.length === 1 ? 'post' : 'posts'})
          </span>
        </div>
        <button
          onClick={onDownloadAllZip}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded border border-cyan-800/40 transition-colors"
          title="Download entire /blog folder hierarchy"
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>Export .zip</span>
        </button>
      </div>

      {/* Directory Content List */}
      <div className="p-2 overflow-y-auto max-h-[600px] font-mono text-xs space-y-1">
        {/* Root /blog folder */}
        <div>
          <button
            type="button"
            onClick={() => toggleFolder('root')}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-neutral-800 text-neutral-300 transition-colors text-left"
          >
            {expandedFolders['root'] ? (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <FolderOpen className="w-4 h-4 text-amber-400/90" />
            <span className="font-semibold text-white">/blog</span>
            <span className="text-[10px] text-neutral-400 font-sans ml-auto">techstarz101.com Root</span>
          </button>

          {expandedFolders['root'] && (
            <div className="pl-4 mt-1 space-y-1 border-l border-neutral-800 ml-3">
              {posts.map((post) => {
                const isSelected = post.id === selectedPostId;
                const isExpanded = expandedFolders[post.id] !== false;

                return (
                  <div key={post.id} className="space-y-0.5">
                    {/* Slug subfolder header */}
                    <div
                      onClick={() => {
                        onSelectPost(post.id);
                        if (!isExpanded) toggleFolder(post.id);
                      }}
                      className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-neutral-800/90 text-cyan-300 border-l-2 border-cyan-400'
                          : 'hover:bg-neutral-800/50 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolder(post.id);
                          }}
                          className="p-0.5 text-neutral-400 hover:text-white"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                        <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />

                        {editingPostId === post.id ? (
                          <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={slugDraft}
                              onChange={(e) => setSlugDraft(e.target.value)}
                              className="bg-neutral-950 border border-cyan-500/80 rounded px-1.5 py-0.5 text-xs text-white font-mono w-full"
                              autoFocus
                            />
                            <button
                              onClick={(e) => handleSaveSlug(post.id, e)}
                              className="p-1 hover:text-emerald-400"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={handleCancelSlug}
                              className="p-1 hover:text-neutral-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate font-medium">/{post.data.slug}</span>
                            {post.data.categories && post.data.categories.length > 0 && (
                              <span className="text-[10px] text-neutral-400 hidden sm:inline">
                                [{post.data.categories.join(',')}]
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Folder Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleStartEditSlug(post, e)}
                          title="Rename post slug"
                          className="p-1 text-neutral-400 hover:text-white rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPostFolderZip(post);
                          }}
                          title="Download folder zip"
                          className="p-1 text-neutral-400 hover:text-cyan-400 rounded"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        {posts.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePost(post.id);
                            }}
                            title="Remove from project"
                            className="p-1 text-neutral-400 hover:text-red-400 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Files inside /[post-slug] */}
                    {isExpanded && (
                      <div className="pl-6 space-y-0.5 border-l border-neutral-800 ml-4">
                        {/* index.html */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPost(post.id);
                            onSelectFile('index.html');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                            isSelected && post.activeFile === 'index.html'
                              ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                              : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                            <span>index.html</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-sans">Template</span>
                        </button>

                        {/* article.md */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPost(post.id);
                            onSelectFile('article.md');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                            isSelected && post.activeFile === 'article.md'
                              ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                              : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            <span>article.md</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-sans">Markdown</span>
                        </button>

                        {/* schema.json */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPost(post.id);
                            onSelectFile('schema.json');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                            isSelected && post.activeFile === 'schema.json'
                              ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                              : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FileJson className="w-3.5 h-3.5 text-amber-400" />
                            <span>schema.json</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-sans">JSON-LD</span>
                        </button>

                        {/* metadata.json */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPost(post.id);
                            onSelectFile('metadata.json');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                            isSelected && post.activeFile === 'metadata.json'
                              ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                              : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FileJson className="w-3.5 h-3.5 text-purple-400" />
                            <span>metadata.json</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-sans">Scraper API</span>
                        </button>

                        {/* featured-image.webp (Optimized Image Asset) */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPost(post.id);
                            onSelectFile('featured-image.webp');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                            isSelected && post.activeFile === 'featured-image.webp'
                              ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                              : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                            <span>featured-image.webp</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-sans font-semibold">
                            {post.data.imageOptimization
                              ? `-${post.data.imageOptimization.savingsPercent}%`
                              : 'WebP'}
                          </span>
                        </button>

                        {/* sitemap.xml (Google SEO Discovery) */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPost(post.id);
                            onSelectFile('sitemap.xml');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                            isSelected && post.activeFile === 'sitemap.xml'
                              ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                              : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-blue-400" />
                            <span>sitemap.xml</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-sans">SEO Map</span>
                        </button>

                        {/* feed.xml (RSS 2.0 Syndication) */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPost(post.id);
                            onSelectFile('feed.xml');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-left ${
                            isSelected && post.activeFile === 'feed.xml'
                              ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                              : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Rss className="w-3.5 h-3.5 text-orange-400" />
                            <span>feed.xml</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-sans">RSS 2.0</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected folder footer info */}
      {selectedPost && (
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/40 mt-auto text-xs text-neutral-400">
          <div className="flex items-center justify-between mb-1">
            <span className="text-neutral-300 font-medium truncate max-w-[170px]">
              {selectedPost.data.title}
            </span>
            <span className="font-mono text-[11px] text-cyan-400">
              {selectedPost.activeFile}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 truncate">
            https://techstarz101.com/blog/{selectedPost.data.slug}
          </div>
        </div>
      )}
    </div>
  );
};
