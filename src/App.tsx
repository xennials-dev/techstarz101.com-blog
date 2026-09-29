import React, { useState } from 'react';
import {
  FolderOpen,
  FileCode,
  Sparkles,
  Download,
  Plus,
  Layers,
  CheckCircle2,
  Terminal,
  BookOpen,
  Users,
  Tag,
  Zap
} from 'lucide-react';
import { Header } from './components/Header';
import { ScraperInput } from './components/ScraperInput';
import { FolderTree } from './components/FolderTree';
import { PostPreview } from './components/PostPreview';
import { CodeViewer } from './components/CodeViewer';
import { SeoAuditView } from './components/SeoAuditView';
import { EditPostModal } from './components/EditPostModal';
import { BatchScraperModal } from './components/BatchScraperModal';
import { ImageOptimizerModal } from './components/ImageOptimizerModal';
import { CategoryFilter } from './components/CategoryFilter';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { AuthorsDirectoryModal } from './components/AuthorsDirectoryModal';
import { BlogPostData, ScrapedPostItem, SampleArticle, Category, AuthorProfile, AntiBotFallbackInfo, SupportedFileType } from './types';
import { generateAllFiles, createSlug } from './utils/templateGenerator';
import { downloadAllBlogFoldersZip } from './utils/folderZip';
import { DEFAULT_AUTHORS, getAuthorByName, getPostsByAuthor } from './utils/authors';

// Default initial seeded posts for techstarz101.com
const INITIAL_POSTS: BlogPostData[] = [
  {
    id: 'post-1',
    title: 'AI Trends in 2025: Autonomous Systems & Edge Inference',
    slug: 'ai-trends-in-2025',
    author: 'Marcus Vance',
    authorId: 'author-marcus',
    authorProfile: DEFAULT_AUTHORS[0],
    categories: ['AI', 'Development'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    imageAlt: 'Autonomous AI agents and neural network edge compute nodes',
    imageOptimization: {
      originalUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      format: 'webp',
      width: 1200,
      height: 675,
      originalSizeBytes: 1420500,
      optimizedSizeBytes: 146200,
      savingsPercent: 89.7,
      fileName: 'featured-image.webp'
    },
    keywords: 'techstarz101, tech blog, artificial intelligence, edge inference, autonomous agents, llm architecture',
    datePublished: '2025-05-05',
    dateModified: '2025-05-05',
    description: 'Explore key AI trends in 2025 including autonomous orchestration and edge inference models designed for resilient systems at techstarz101.com.',
    introduction: "Welcome to the latest blog post from techstarz101.com! In this article, we’ll explore the pivotal shifts redefining artificial intelligence in 2025, diving into autonomous agent orchestration, quantized edge models, and how veteran developers can harness these systems without sacrificing predictability. Whether you’re an experienced engineer or scaling an early-stage startup, this post will provide you with actionable insights.",
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
      { title: 'Event-Driven Architectures: High Throughput Scaling', slug: 'event-driven-scaling-architectures' },
      { title: 'Startup Tech Stack Selection', slug: 'startup-tech-stack' }
    ]
  },
  {
    id: 'post-2',
    title: 'The Modern Engineer: Analog Foundations to Modern Cloud',
    slug: 'the-modern-engineer',
    author: 'Elena Rostova',
    authorId: 'author-elena',
    authorProfile: DEFAULT_AUTHORS[1],
    categories: ['Development', 'General Tech'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    imageAlt: 'Microchip architecture diagram and modern cloud virtualization layers',
    imageOptimization: {
      originalUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
      format: 'webp',
      width: 1200,
      height: 800,
      originalSizeBytes: 1890000,
      optimizedSizeBytes: 198000,
      savingsPercent: 89.5,
      fileName: 'featured-image.webp'
    },
    keywords: 'techstarz101, tech blog, software engineering, systems design, legacy modernization, cloud computing',
    datePublished: '2025-05-12',
    dateModified: '2025-05-12',
    description: 'Discover how foundational systems thinking bridges hardware realities with modern distributed cloud infrastructure at techstarz101.com.',
    introduction: "Welcome to the latest blog post from techstarz101.com! In this article, we’ll explore the unique demographic advantage of developers who master both physical machine constraints and modern cloud computing. Whether you’re architecting microservices or migrating legacy monoliths, this post will help you build better software.",
    sections: [
      {
        heading: 'The Dual Fluency of Modern Systems Engineers',
        paragraphs: [
          'Technologists who remember the tactile reality of physical memory limits, manual interrupt routing, and latency handshakes approach modern cloud abstractions with healthy skepticism.',
          'This perspective prevents over-engineering and keeps distributed systems grounded in predictable machine execution.'
        ]
      },
      {
        heading: 'When High Abstraction Meets Physical Reality',
        paragraphs: [
          'Modern virtualization often masks the harsh reality of packet drop, cold starts, and disk I/O contention. Engineers who learned memory allocation build fundamentally sturdier distributed systems.',
          'Understanding what the hardware is actually executing remains the sharpest competitive advantage in modern cloud infrastructure.'
        ]
      }
    ],
    relatedPosts: [
      { title: 'AI Trends in 2025: Autonomous Systems', slug: 'ai-trends-in-2025' },
      { title: 'Event-Driven Architectures: High Throughput Scaling', slug: 'event-driven-scaling-architectures' },
      { title: 'Top Developer Tools in 2025', slug: 'top-developer-tools' }
    ]
  },
  {
    id: 'post-3',
    title: 'Event-Driven Architectures: High Throughput Scaling',
    slug: 'event-driven-scaling-architectures',
    author: 'David Chen',
    authorId: 'author-david',
    authorProfile: DEFAULT_AUTHORS[2],
    categories: ['Startups', 'Development'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    keywords: 'techstarz101, tech blog, event driven architecture, distributed systems, kafka, queue scalability, startups',
    datePublished: '2025-05-18',
    dateModified: '2025-05-18',
    description: 'Learn how to architect event-driven systems that decouple startup services and handle sudden traffic spikes reliably at techstarz101.com.',
    introduction: "Welcome to the latest blog post from techstarz101.com! In this article, we’ll explore event-driven architecture, diving into idempotency patterns, log-based messaging, and how to scale applications under unpredictable spikes. Whether you’re refactoring a synchronous bottleneck or deploying event streaming, this post will provide actionable takeaways.",
    sections: [
      {
        heading: 'The Synchronous Dependency Trap for Startups',
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
      { title: 'Startup Tech Stack Selection', slug: 'startup-tech-stack' },
      { title: 'AI Trends in 2025', slug: 'ai-trends-in-2025' },
      { title: 'The Modern Engineer: Hardware to Cloud', slug: 'the-modern-engineer' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'scraper' | 'preview' | 'files' | 'audit'>('scraper');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [posts, setPosts] = useState<ScrapedPostItem[]>(() => {
    return INITIAL_POSTS.map(data => ({
      id: data.id,
      data,
      files: generateAllFiles(data, INITIAL_POSTS),
      activeFile: 'index.html'
    }));
  });
  const [selectedPostId, setSelectedPostId] = useState<string>('post-1');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [antiBotInfo, setAntiBotInfo] = useState<AntiBotFallbackInfo | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isImageOptimizerOpen, setIsImageOptimizerOpen] = useState(false);
  const [isAuthorsDirectoryOpen, setIsAuthorsDirectoryOpen] = useState(false);
  const [viewingAuthor, setViewingAuthor] = useState<AuthorProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter posts based on selected category
  const filteredPosts = posts.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.data.categories && p.data.categories.includes(selectedCategory);
  });

  const selectedPost = posts.find(p => p.id === selectedPostId) || posts[0];

  // Scrape via backend API with automated image optimization, caching, and anti-bot shield
  const handleScrapeUrl = async (
    url: string,
    enrichWithAi: boolean,
    categories: Category[],
    optimizeImage: boolean = true,
    forceRefresh: boolean = false
  ) => {
    setAntiBotInfo(null);
    setIsLoading(true);
    setStatusMessage('Initiating crawler & checking cache shield...');

    try {
      setStatusMessage('Extracting HTML DOM & analyzing metadata...');
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, enrichWithAi, categories, optimizeImage, forceRefresh })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (json.antiBotTriggered) {
          setAntiBotInfo({
            triggered: true,
            statusCode: json.statusCode,
            domain: json.domain,
            message: json.error,
            sourceUrl: url
          });
          showToast(`Anti-bot challenge detected from ${json.domain || 'host'}`);
          return;
        }
        throw new Error(json.error || `Scrape failed with HTTP ${res.status}`);
      }

      setStatusMessage('Generating Table of Contents, WebP image asset & static files...');
      const authorProfile = json.data.authorProfile || getAuthorByName(json.data.author);
      const newPostData: BlogPostData = {
        id: `post-${Date.now()}`,
        ...json.data,
        sourceUrl: url,
        categories: categories.length > 0 ? categories : json.data.categories || ['General Tech'],
        authorProfile
      };

      const allPostsData = [newPostData, ...posts.map(p => p.data)];
      const newPostItem: ScrapedPostItem = {
        id: newPostData.id,
        data: newPostData,
        files: generateAllFiles(newPostData, allPostsData),
        activeFile: 'index.html'
      };

      setPosts(prev => [newPostItem, ...prev]);
      setSelectedPostId(newPostItem.id);
      setActiveTab('preview');
      if (json.fromCache) {
        showToast(`Loaded from deduplication cache (/blog/${newPostData.slug}/)`);
      } else if (newPostData.imageOptimization) {
        showToast(`Populated /blog/${newPostData.slug}/ with WebP image (-${newPostData.imageOptimization.savingsPercent}% saved)`);
      } else {
        showToast(`Successfully populated /blog/${newPostData.slug}/`);
      }
    } catch (err: any) {
      console.error('Scrape error:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Scrape from raw HTML or text
  const handleScrapeRaw = async (rawHtml: string, enrichWithAi: boolean, categories: Category[], optimizeImage: boolean = true) => {
    setIsLoading(true);
    setStatusMessage('Parsing raw document structure...');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawHtml, enrichWithAi, categories, optimizeImage })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Processing failed with HTTP ${res.status}`);
      }

      const json = await res.json();
      const authorProfile = json.data.authorProfile || getAuthorByName(json.data.author);
      const newPostData: BlogPostData = {
        id: `post-${Date.now()}`,
        ...json.data,
        categories: categories.length > 0 ? categories : json.data.categories || ['General Tech'],
        authorProfile
      };

      const newPostItem: ScrapedPostItem = {
        id: newPostData.id,
        data: newPostData,
        files: generateAllFiles(newPostData),
        activeFile: 'index.html'
      };

      setPosts(prev => [newPostItem, ...prev]);
      setSelectedPostId(newPostItem.id);
      setActiveTab('preview');
      showToast(`Generated /blog/${newPostData.slug}/ from raw content`);
    } catch (err: any) {
      console.error('Raw scrape error:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // 1-Click Load Sample
  const handleLoadSample = (sample: SampleArticle) => {
    const existing = posts.find(p => p.data.slug === sample.mockData.slug);
    if (existing) {
      setSelectedPostId(existing.id);
      setActiveTab('preview');
      showToast(`Selected existing /blog/${sample.mockData.slug}/`);
      return;
    }

    const authorProfile = sample.mockData.authorProfile || getAuthorByName(sample.mockData.author);
    const newPostData: BlogPostData = {
      id: `post-${Date.now()}`,
      ...sample.mockData,
      authorProfile
    };

    const newPostItem: ScrapedPostItem = {
      id: newPostData.id,
      data: newPostData,
      files: generateAllFiles(newPostData),
      activeFile: 'index.html'
    };

    setPosts(prev => [newPostItem, ...prev]);
    setSelectedPostId(newPostItem.id);
    setActiveTab('preview');
    showToast(`Loaded sample into /blog/${newPostData.slug}/`);
  };

  // Change active file in the currently selected post
  const handleSelectFile = (file: SupportedFileType) => {
    setPosts(prev =>
      prev.map(p => (p.id === selectedPostId ? { ...p, activeFile: file } : p))
    );
  };

  // Update slug inline
  const handleUpdateSlug = (id: string, newSlug: string) => {
    const clean = createSlug(newSlug);
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updatedData = { ...p.data, slug: clean };
          return {
            ...p,
            data: updatedData,
            files: generateAllFiles(updatedData)
          };
        }
        return p;
      })
    );
    showToast(`Updated folder path to /blog/${clean}/`);
  };

  // Delete post
  const handleDeletePost = (id: string) => {
    const remaining = posts.filter(p => p.id !== id);
    if (remaining.length > 0) {
      setPosts(remaining);
      if (selectedPostId === id) {
        setSelectedPostId(remaining[0].id);
      }
      showToast('Post removed from project');
    }
  };

  // Save edited post data from modal
  const handleSaveEditedPost = (updated: BlogPostData) => {
    setPosts(prev => {
      const allPostsData = prev.map(p => (p.id === updated.id ? updated : p.data));
      return prev.map(p =>
        p.id === updated.id
          ? {
              ...p,
              data: updated,
              files: generateAllFiles(updated, allPostsData)
            }
          : {
              ...p,
              files: generateAllFiles(p.data, allPostsData)
            }
      );
    });
    showToast('Updated post and regenerated static template, TOC, sitemap, and RSS files');
  };

  // Open Author Profile modal
  const handleViewAuthor = (authorName: string) => {
    const author = getAuthorByName(authorName);
    setViewingAuthor(author);
  };

  // Apply image optimization results
  const handleApplyOptimization = (info: any) => {
    const updatedData: BlogPostData = {
      ...selectedPost.data,
      imageOptimization: info
    };
    handleSaveEditedPost(updatedData);
    showToast(`Compressed feature image to WebP (-${info.savingsPercent}% saved)`);
  };

  // Download all posts as ZIP
  const handleDownloadAllZip = async () => {
    try {
      await downloadAllBlogFoldersZip(posts);
      showToast('Exported complete /blog static archive (.zip)');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to export ZIP');
    }
  };

  // Batch Scrape Pipeline
  const handleRunBatch = async (urls: string[]) => {
    setIsLoading(true);
    setIsBatchModalOpen(false);
    showToast(`Starting batch scrape of ${urls.length} URLs...`);

    let successCount = 0;
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setStatusMessage(`Scraping (${i + 1}/${urls.length}): ${url}...`);
      try {
        const res = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, enrichWithAi: false })
        });
        if (res.ok) {
          const json = await res.json();
          const authorProfile = json.data.authorProfile || getAuthorByName(json.data.author);
          const newPostData: BlogPostData = {
            id: `post-${Date.now()}-${i}`,
            ...json.data,
            categories: json.data.categories || ['General Tech'],
            authorProfile
          };
          const newPostItem: ScrapedPostItem = {
            id: newPostData.id,
            data: newPostData,
            files: generateAllFiles(newPostData),
            activeFile: 'index.html'
          };
          setPosts(prev => [newPostItem, ...prev]);
          successCount++;
        }
      } catch (e) {
        console.warn('Batch item failed:', url, e);
      }
    }

    setIsLoading(false);
    setStatusMessage('');
    showToast(`Batch completed: ${successCount} new folders added to /blog`);
    setActiveTab('files');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 border border-cyan-500/40 text-neutral-100 text-xs shadow-2xl animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadAllZip={handleDownloadAllZip}
        onNewScrapeClick={() => setActiveTab('scraper')}
        onOpenAuthors={() => setIsAuthorsDirectoryOpen(true)}
        postCount={posts.length}
      />

      {/* Contextual Bar: Categories & Active Path */}
      <div className="border-b border-neutral-850 bg-neutral-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Filter Controls */}
          <div className="flex-1 min-w-[280px]">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              posts={posts.map(p => p.data)}
            />
          </div>

          {/* Right path info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px] hidden sm:flex">
              <span className="text-cyan-400 font-semibold">techstarz101.com</span>
              <span>/</span>
              <span>blog</span>
              <span>/</span>
              <span className="text-white font-medium bg-neutral-800/80 px-2 py-0.5 rounded">
                {selectedPost.data.slug}
              </span>
            </div>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <button
              onClick={() => setIsImageOptimizerOpen(true)}
              className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors"
              title="Automated Image Resizing & WebP Compression"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Image Optimizer</span>
              {selectedPost.data.imageOptimization && (
                <span className="bg-emerald-950/70 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-800/40">
                  -{selectedPost.data.imageOptimization.savingsPercent}%
                </span>
              )}
            </button>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Batch Scraper</span>
            </button>
            <span className="text-neutral-700">|</span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors"
            >
              <span>Edit Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col">
        {activeTab === 'scraper' && (
          <div className="space-y-8">
            {/* Studio Hero Intro */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 border border-cyan-500/30 bg-cyan-950/20 px-2 py-0.5 rounded">
                  techstarz101.com
                </span>
                <span className="text-xs text-neutral-400">
                  Categories: AI &bull; Development &bull; Startups &bull; General Tech
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Blog Scraper &amp; Static Folder Populator
              </h1>
              <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
                Automatically extract content from external tech blogs, format it into the SEO-optimized, schema-compliant <code className="text-cyan-300">techstarz101.com</code> HTML template, and organize output into clean <code className="text-cyan-300">/blog/[post-slug]/index.html</code> static folder trees with rich author attribution.
              </p>
            </div>

            {/* Ingestion Console */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 sm:p-6 shadow-sm">
              <ScraperInput
                onScrapeUrl={handleScrapeUrl}
                onScrapeRaw={handleScrapeRaw}
                onLoadSample={handleLoadSample}
                isLoading={isLoading}
                statusMessage={statusMessage}
                existingPosts={posts.map(p => p.data)}
                onSelectExistingPost={(id) => {
                  setSelectedPostId(id);
                  setActiveTab('preview');
                }}
                antiBotInfo={antiBotInfo}
                onClearAntiBot={() => setAntiBotInfo(null)}
              />
            </div>

            {/* Quick Architecture Explainer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-neutral-850 bg-neutral-900/40 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                  <Terminal className="w-4 h-4" />
                  <span>Folder Structure Populator</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Generates ready-to-deploy <code className="text-neutral-300">/blog/[post-slug]/</code> folders containing standalone <code className="text-neutral-300">index.html</code>, markdown backups, and API metadata.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-850 bg-neutral-900/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <Users className="w-4 h-4" />
                  <span>Author Profiles &amp; Social Links</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Full author cards at the end of each post with biography, Twitter/X, and LinkedIn links, embedded in Schema.org <code className="text-neutral-300">Person</code> markup.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-850 bg-neutral-900/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Tag className="w-4 h-4" />
                  <span>Multi-Category Architecture</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Assign one or more categories (<code className="text-neutral-300">AI</code>, <code className="text-neutral-300">Development</code>, <code className="text-neutral-300">Startups</code>, <code className="text-neutral-300">General Tech</code>) with real-time filtering and audit.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex-1 flex flex-col min-h-[700px]">
            <PostPreview
              post={selectedPost.data}
              onEditClick={() => setIsEditModalOpen(true)}
              onViewAuthor={handleViewAuthor}
              onOpenOptimizer={() => setIsImageOptimizerOpen(true)}
            />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[700px]">
            {/* Left: Folder Tree Explorer (4 cols) */}
            <div className="lg:col-span-4 h-full">
              <FolderTree
                posts={filteredPosts}
                selectedPostId={selectedPostId}
                onSelectPost={(id) => setSelectedPostId(id)}
                onSelectFile={handleSelectFile}
                onUpdateSlug={handleUpdateSlug}
                onDeletePost={handleDeletePost}
                onDownloadAllZip={handleDownloadAllZip}
              />
            </div>

            {/* Right: Code Viewer (8 cols) */}
            <div className="lg:col-span-8 h-full">
              <CodeViewer
                files={selectedPost.files}
                post={selectedPost.data}
                activeFile={selectedPost.activeFile}
                onSelectFile={handleSelectFile}
                onOpenOptimizer={() => setIsImageOptimizerOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-white">SEO &amp; Schema Audit Report &bull; techstarz101.com</h2>
                <p className="text-xs text-neutral-400">
                  Target: <span className="font-mono text-cyan-400">/blog/{selectedPost.data.slug}</span> &bull; Author: <span className="text-white">{selectedPost.data.author}</span>
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors"
              >
                Adjust Metadata
              </button>
            </div>
            <SeoAuditView
              post={selectedPost.data}
              onEditClick={() => setIsEditModalOpen(true)}
              onUpdatePost={handleSaveEditedPost}
              onOpenOptimizer={() => setIsImageOptimizerOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Edit Post Modal */}
      <EditPostModal
        post={selectedPost.data}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditedPost}
      />

      {/* Automated Image Optimizer Modal */}
      <ImageOptimizerModal
        post={selectedPost.data}
        isOpen={isImageOptimizerOpen}
        onClose={() => setIsImageOptimizerOpen(false)}
        onApplyOptimization={handleApplyOptimization}
      />

      {/* Batch Scraper Modal */}
      <BatchScraperModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onRunBatch={handleRunBatch}
        isProcessing={isLoading}
      />

      {/* Single Author Profile Modal */}
      {viewingAuthor && (
        <AuthorProfileModal
          author={viewingAuthor}
          authorPosts={getPostsByAuthor(posts.map(p => p.data), viewingAuthor.name)}
          isOpen={!!viewingAuthor}
          onClose={() => setViewingAuthor(null)}
          onSelectPost={(id) => {
            setSelectedPostId(id);
            setActiveTab('preview');
          }}
        />
      )}

      {/* Full Authors Directory Modal */}
      <AuthorsDirectoryModal
        isOpen={isAuthorsDirectoryOpen}
        onClose={() => setIsAuthorsDirectoryOpen(false)}
        posts={posts.map(p => p.data)}
        onSelectPost={(id) => {
          setSelectedPostId(id);
          setActiveTab('preview');
        }}
      />
    </div>
  );
}
