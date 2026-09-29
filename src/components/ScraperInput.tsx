import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileCode2,
  Sparkles,
  ArrowRight,
  Loader2,
  Compass,
  Tag,
  Check,
  Zap,
  ShieldAlert,
  Clock,
  Database,
  AlertTriangle,
  ExternalLink,
  FileText,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { SampleArticle, Category, BlogPostData, AntiBotFallbackInfo } from '../types';
import { createSlug } from '../utils/templateGenerator';

interface ScraperInputProps {
  onScrapeUrl: (url: string, enrichWithAi: boolean, categories: Category[], optimizeImage: boolean, forceRefresh?: boolean) => Promise<void>;
  onScrapeRaw: (rawHtml: string, enrichWithAi: boolean, categories: Category[], optimizeImage: boolean) => Promise<void>;
  onLoadSample: (sample: SampleArticle) => void;
  isLoading: boolean;
  statusMessage: string;
  existingPosts?: BlogPostData[];
  onSelectExistingPost?: (postId: string) => void;
  antiBotInfo?: AntiBotFallbackInfo | null;
  onClearAntiBot?: () => void;
}

const ALL_CATEGORIES: Category[] = ['AI', 'Development', 'Startups', 'General Tech'];

const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    id: 'ai-trends-2025',
    name: 'AI Trends in 2025',
    url: 'https://news.ycombinator.com/ai-trends-2025',
    sampleType: 'AI Systems',
    categories: ['AI', 'Development'],
    mockData: {
      title: 'AI Trends in 2025: Autonomous Systems & Edge Inference',
      slug: 'ai-trends-in-2025',
      author: 'Marcus Vance',
      authorId: 'author-marcus',
      categories: ['AI', 'Development'],
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      keywords: 'techstarz101, tech blog, artificial intelligence, edge inference, autonomous agents, llm architecture',
      datePublished: '2025-05-05',
      dateModified: '2025-05-05',
      description: 'Explore key AI trends in 2025 including autonomous agent orchestration and edge inference models designed for resilient systems at techstarz101.com.',
      introduction: "Welcome to the latest blog post from techstarz101.com! In this article, we’ll explore the pivotal shifts redefining artificial intelligence in 2025, diving into autonomous agent orchestration, quantized edge models, and how veteran developers can harness these systems without sacrificing predictability. Whether you’re an experienced software engineer or building a new startup, this guide offers actionable technical takeaways.",
      sections: [
        {
          heading: 'From Reactive Chatbots to Autonomous Agentic Workflows',
          paragraphs: [
            'The conversational interface was merely the initial gateway. In 2025, production engineering teams have moved decisively toward deterministic tool-calling workflows and multi-agent coordination loops.',
            'Instead of expecting a single monolithic model to hallucinate business logic, robust architectures decompose complex tasks into verifiable pipelines backed by static schema enforcement.'
          ]
        },
        {
          heading: 'Edge Quantization & On-Device Micro-Inference',
          paragraphs: [
            'The economic and latency costs of round-tripping every keystroke to remote GPU clusters triggered an aggressive shift toward 2-bit and 4-bit localized weights running directly on user hardware.',
            'Developers with roots in embedded systems and C/C++ memory models are finding unexpected parity with modern WebAssembly and WebGPU execution contexts.'
          ]
        },
        {
          heading: 'Engineering Invariants for the Next Decade',
          paragraphs: [
            'As model capabilities accelerate, the core software principles remain unyielding: write clear contracts, monitor failure modes, and treat AI outputs as untrusted user input.',
            'Teams that integrate rigorous automated evals into their standard CI/CD pipelines consistently outperform those relying on speculative prompt tuning.'
          ]
        }
      ],
      relatedPosts: [
        { title: 'The Modern Engineer: Hardware to Cloud', slug: 'the-modern-engineer' },
        { title: 'Event-Driven Scaling Architecture', slug: 'event-driven-scaling-architectures' },
        { title: 'Top Developer Tools in 2025', slug: 'top-developer-tools' }
      ]
    }
  },
  {
    id: 'the-modern-engineer',
    name: 'The Modern Engineer',
    url: 'https://dev.to/the-modern-engineer-analog-to-cloud',
    sampleType: 'Systems Culture',
    categories: ['Development', 'General Tech'],
    mockData: {
      title: 'The Modern Engineer: Analog Foundations to Modern Cloud',
      slug: 'the-modern-engineer',
      author: 'Elena Rostova',
      authorId: 'author-elena',
      categories: ['Development', 'General Tech'],
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
      keywords: 'techstarz101, tech blog, software engineering, systems design, legacy modernization, cloud computing',
      datePublished: '2025-05-12',
      dateModified: '2025-05-12',
      description: 'Discover how foundational systems thinking bridges hardware realities with modern distributed cloud infrastructure at techstarz101.com.',
      introduction: "Welcome to the latest blog post from techstarz101.com! In this article, we’ll explore the unique advantage of developers who master both physical machine constraints and modern distributed systems. Whether you’re architecting microservices or migrating legacy monoliths, this post will help you build faster, cleaner software.",
      sections: [
        {
          heading: 'The Dual Fluency of Modern Systems Engineers',
          paragraphs: [
            'Technologists who remember the physical reality of memory limits, manual interrupt routing, and latency handshakes approach modern cloud abstractions with healthy skepticism.',
            'This perspective prevents over-engineering and keeps distributed systems grounded in predictable machine execution.'
          ]
        },
        {
          heading: 'When High Abstraction Meets Physical Reality',
          paragraphs: [
            'Virtualization and serverless runtimes often mask packet drop, cold starts, and disk I/O contention. Engineers who understand memory allocation build fundamentally sturdier distributed systems.',
            'Knowing what the physical hardware is actually executing remains the sharpest competitive advantage in modern cloud architecture.'
          ]
        }
      ],
      relatedPosts: [
        { title: 'AI Trends in 2025: Autonomous Systems', slug: 'ai-trends-in-2025' },
        { title: 'Event-Driven Architectures: High Throughput Scaling', slug: 'event-driven-scaling-architectures' },
        { title: 'Developer Productivity Playbook', slug: 'dev-productivity' }
      ]
    }
  },
  {
    id: 'event-driven-scaling',
    name: 'Event-Driven Scaling',
    url: 'https://martinfowler.com/articles/event-driven-scaling',
    sampleType: 'Architecture',
    categories: ['Startups', 'Development'],
    mockData: {
      title: 'Event-Driven Architectures: High Throughput Scaling',
      slug: 'event-driven-scaling-architectures',
      author: 'David Chen',
      authorId: 'author-david',
      categories: ['Startups', 'Development'],
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
      keywords: 'techstarz101, tech blog, event driven architecture, distributed systems, kafka, queue scalability, startups',
      datePublished: '2025-05-18',
      dateModified: '2025-05-18',
      description: 'Learn how to architect event-driven systems that decouple startup services and handle sudden traffic surges without downtime at techstarz101.com.',
      introduction: "Welcome to the latest blog post from techstarz101.com! In this article, we’ll explore event-driven architecture for high-growth tech startups, diving into idempotency patterns, transactional outboxes, and how to scale under unpredictable user spikes.",
      sections: [
        {
          heading: 'The Synchronous Dependency Trap for Scaling Startups',
          paragraphs: [
            'Cascading HTTP call graphs create tight temporal coupling, where a single degraded downstream database degrades the entire application perimeter.',
            'By transforming point-to-point synchronous RPCs into durable append-only event streams, systems isolate failures naturally.'
          ]
        },
        {
          heading: 'Idempotency and Exactly-Once Semantics in Practice',
          paragraphs: [
            'Distributed systems guarantee at-least-once delivery, making defensive consumer idempotency a core requirement rather than an afterthought.',
            'Simple transactional outbox tables and deduplication keys provide 99.9% of the guarantees that over-engineered distributed locks claim to deliver.'
          ]
        }
      ],
      relatedPosts: [
        { title: 'AI Trends in 2025', slug: 'ai-trends-in-2025' },
        { title: 'The Modern Engineer: Hardware to Cloud', slug: 'the-modern-engineer' },
        { title: 'Startup Tech Stack Selection', slug: 'startup-tech-stack' }
      ]
    }
  }
];

export const ScraperInput: React.FC<ScraperInputProps> = ({
  onScrapeUrl,
  onScrapeRaw,
  onLoadSample,
  isLoading,
  statusMessage,
  existingPosts = [],
  onSelectExistingPost,
  antiBotInfo,
  onClearAntiBot
}) => {
  const [mode, setMode] = useState<'url' | 'raw'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [enrichWithAi, setEnrichWithAi] = useState(true);
  const [autoOptimizeImage, setAutoOptimizeImage] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['General Tech']);
  const [inputError, setInputError] = useState<string | null>(null);

  // Check if URL is already imported in existing posts (Deduplication Check)
  const trimmedUrl = urlInput.trim().toLowerCase();
  const duplicatePost = existingPosts.find(p => {
    if (!trimmedUrl) return false;
    if (p.sourceUrl && p.sourceUrl.toLowerCase() === trimmedUrl) return true;
    const urlLastPart = trimmedUrl.split('/').filter(Boolean).pop();
    if (urlLastPart && p.slug === createSlug(urlLastPart)) return true;
    return false;
  });

  const toggleCategory = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return;
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent, forceRefresh: boolean = false) => {
    e.preventDefault();
    setInputError(null);
    if (!urlInput.trim()) {
      setInputError('Please enter a target blog URL.');
      return;
    }
    try {
      await onScrapeUrl(urlInput.trim(), enrichWithAi, selectedCategories, autoOptimizeImage, forceRefresh);
    } catch (err: any) {
      setInputError(err.message || 'Scraping failed.');
    }
  };

  const handleRawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    if (!rawContent.trim()) {
      setInputError('Please paste HTML or article content.');
      return;
    }
    try {
      await onScrapeRaw(rawContent.trim(), enrichWithAi, selectedCategories, autoOptimizeImage);
    } catch (err: any) {
      setInputError(err.message || 'Processing raw content failed.');
    }
  };

  // Switch to reader fallback mode when anti-bot challenge is triggered
  const handleSwitchToAntiBotReader = () => {
    setMode('raw');
    if (onClearAntiBot) onClearAntiBot();
    if (!rawContent) {
      setRawContent(`<!-- Reader fallback for ${urlInput || antiBotInfo?.sourceUrl || 'article'} -->
<article>
  <h1>Article Title Here</h1>
  <p>Paste the copied article body text from your browser here...</p>
</article>`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'url' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live URL Scraper</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('raw')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'raw' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paste HTML / Reader</span>
          </button>
        </div>

        {/* Automated Options (AI + Image Optimization) */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={autoOptimizeImage}
              onChange={(e) => setAutoOptimizeImage(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 text-cyan-500 focus:ring-cyan-500/20 bg-neutral-900"
            />
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">Auto-Compress to WebP (1200px)</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={enrichWithAi}
              onChange={(e) => setEnrichWithAi(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 text-cyan-500 focus:ring-cyan-500/20 bg-neutral-900"
            />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">AI Polish</span>
            </span>
          </label>
        </div>
      </div>

      {/* Categories Assignment for Ingest */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          <span>Assign Categories:</span>
        </span>
        {ALL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              <Check className={`w-3 h-3 ${isSelected ? 'opacity-100 text-cyan-400' : 'opacity-0'}`} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Anti-Bot & Rate-Limit Shield Alert Banner */}
      {antiBotInfo && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Anti-Bot / Rate-Limit Shield Active
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                  HTTP {antiBotInfo.statusCode || 403} &bull; {antiBotInfo.domain || 'Target'}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                The external host ({antiBotInfo.domain}) blocked direct bot crawler requests via Cloudflare or a rate limit.
                You can bypass this instantly using the anti-bot reader fallback without getting blocked.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-800/30">
            <button
              type="button"
              onClick={handleSwitchToAntiBotReader}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1-Click Switch to Reader Paste Mode</span>
            </button>
            <span className="text-[11px] text-neutral-400 font-mono">
              Tip: Press Ctrl+A/Cmd+A on the article page, copy, and paste here.
            </span>
          </div>
        </div>
      )}

      {/* URL Deduplication Alert */}
      {mode === 'url' && duplicatePost && (
        <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="text-white font-semibold">Already in project: </span>
              <span className="text-cyan-300 font-mono">/blog/{duplicatePost.slug}</span>
              <span className="text-neutral-400 ml-1.5">({duplicatePost.title})</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onSelectExistingPost && (
              <button
                type="button"
                onClick={() => onSelectExistingPost(duplicatePost.id)}
                className="px-2.5 py-1 text-xs font-medium text-cyan-300 hover:text-white bg-cyan-950 border border-cyan-800 rounded transition-colors"
              >
                View Existing
              </button>
            )}
            <button
              type="button"
              onClick={(e) => handleUrlSubmit(e, true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded transition-colors"
              title="Force re-scrape and overwrite"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Re-scrape</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Section */}
      {mode === 'url' ? (
        <form onSubmit={(e) => handleUrlSubmit(e, false)} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setInputError(null);
                  if (onClearAntiBot) onClearAntiBot();
                }}
                placeholder="https://techcrunch.com/... or https://dev.to/... or https://news.ycombinator.com/..."
                disabled={isLoading}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scraping &amp; Formatting...</span>
                </>
              ) : (
                <>
                  <span>Scrape to /blog/[slug]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <p>
              Extracts title, meta tags, Schema.org BlogPosting, author info, Table of Contents, and outputs to <code className="text-cyan-300">/blog/[post-slug]/index.html</code>.
            </p>
            <span className="font-mono text-[11px] text-neutral-500 hidden sm:inline">
              Shield + Cache Active
            </span>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRawSubmit} className="space-y-3">
          <textarea
            value={rawContent}
            onChange={(e) => { setRawContent(e.target.value); setInputError(null); }}
            placeholder="Paste raw scraped HTML, reader view text, or article markdown..."
            rows={7}
            disabled={isLoading}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 font-mono resize-y"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xs text-neutral-400">
              Ideal for Cloudflare-protected sites or paywalled articles. Generates full static folder tree.
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Format to techstarz101.com Template</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Error notification */}
      {inputError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{inputError}</span>
        </div>
      )}

      {/* Progress / Status Bar */}
      {isLoading && (
        <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-white">{statusMessage || 'Fetching content...'}</p>
            <p className="text-[11px] text-neutral-400">
              Generating Table of Contents, Schema.org BlogPosting, WebP image asset, and XML sitemap.
            </p>
          </div>
        </div>
      )}

      {/* 1-Click Curated Sample Articles */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2 text-xs text-neutral-400 font-medium">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Or test immediately with pre-configured tech articles:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_ARTICLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                setUrlInput(sample.url);
                onLoadSample(sample);
              }}
              className="text-left p-3 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 transition-all group"
            >
              <div className="text-[11px] font-mono text-cyan-400 mb-1 flex items-center justify-between">
                <span>{sample.categories.join(' · ')}</span>
                <span className="text-neutral-500 group-hover:text-cyan-400 transition-colors">1-click &rarr;</span>
              </div>
              <div className="text-xs font-semibold text-neutral-200 group-hover:text-white line-clamp-1">
                {sample.name}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                {sample.sampleType} &bull; Reading time &amp; TOC included
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
