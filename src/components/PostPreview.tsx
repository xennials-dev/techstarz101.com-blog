import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Edit3,
  Calendar,
  User,
  Share2,
  Check,
  Twitter,
  Linkedin,
  Github,
  Tag,
  Zap,
  Clock,
  ListOrdered,
  Hash,
  Rss
} from 'lucide-react';
import { BlogPostData } from '../types';
import { getAuthorByName } from '../utils/authors';
import { calculateReadingStats, generateTableOfContents } from '../utils/templateGenerator';
import { TechstarzLogo } from './TechstarzLogo';

interface PostPreviewProps {
  post: BlogPostData;
  onEditClick: () => void;
  onViewAuthor: (authorName: string) => void;
  onOpenOptimizer?: () => void;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  post,
  onEditClick,
  onViewAuthor,
  onOpenOptimizer
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedLink, setCopiedLink] = useState(false);

  const author = post.authorProfile || getAuthorByName(post.author);
  const canonicalUrl = `https://techstarz101.com/blog/${post.slug}`;
  const readingStats = calculateReadingStats(post);
  const toc = generateTableOfContents(post.sections || []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, anchorId: string) => {
    e.preventDefault();
    const elem = document.getElementById(anchorId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerWidthClass = {
    desktop: 'w-full max-w-4xl',
    tablet: 'w-full max-w-2xl',
    mobile: 'w-full max-w-sm'
  }[device];

  return (
    <div className="flex flex-col h-full bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* Top Preview Controls Bar */}
      <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-200">Simulated Page View:</span>
          <span className="text-xs font-mono text-cyan-400 truncate max-w-xs sm:max-w-md">
            /blog/{post.slug}/index.html
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device viewport switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg">
            <button
              onClick={() => setDevice('desktop')}
              title="Desktop 100%"
              className={`p-1 rounded ${device === 'desktop' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              title="Tablet 768px"
              className={`p-1 rounded ${device === 'tablet' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white'}`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              title="Mobile 380px"
              className={`p-1 rounded ${device === 'mobile' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {onOpenOptimizer && (
            <button
              onClick={onOpenOptimizer}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/50 rounded-md transition-colors font-medium"
              title="Resize and compress feature image"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Optimize Image</span>
            </button>
          )}

          <button
            onClick={onEditClick}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-md transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Post</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-md transition-colors"
            title="Copy Canonical URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Viewport Frame */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-neutral-950/40">
        <div className={`transition-all duration-300 bg-neutral-950 border border-neutral-800/80 rounded-lg shadow-xl overflow-hidden ${containerWidthClass}`}>
          {/* Mock Browser Header for techstarz101.com */}
          <header className="border-b border-neutral-800 px-6 py-3.5 flex items-center justify-between bg-neutral-950">
            <div className="flex items-center gap-2">
              <TechstarzLogo size="sm" showDomain={true} />
            </div>
            <nav className="text-xs text-neutral-400 flex items-center gap-4">
              <span className="hover:text-cyan-400 cursor-pointer">Articles</span>
              <span className="hover:text-cyan-400 cursor-pointer">Categories</span>
              <button
                onClick={() => onViewAuthor(author.name)}
                className="hover:text-cyan-400 cursor-pointer text-left"
              >
                Authors
              </button>
            </nav>
          </header>

          {/* Main Article Content */}
          <main className="px-6 sm:px-10 py-8 max-w-2xl mx-auto">
            <article>
              {/* Category Badges */}
              <div className="flex items-center gap-2 mb-3">
                {(post.categories || ['General Tech']).map((cat, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold uppercase tracking-wider text-cyan-400"
                  >
                    {cat}
                    {i < (post.categories?.length || 1) - 1 && (
                      <span className="text-neutral-600 ml-2" aria-hidden="true">&bull;</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Meta information with Reading Time & Word Count */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mb-3">
                <button
                  onClick={() => onViewAuthor(author.name)}
                  className="text-neutral-300 font-medium hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-5 h-5 rounded-full object-cover border border-neutral-700"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <span>By {author.name}</span>
                </button>
                <span aria-hidden="true">&middot;</span>
                <time dateTime={post.datePublished}>{post.datePublished}</time>
                <span aria-hidden="true">&middot;</span>
                <span className="flex items-center gap-1 text-neutral-300 font-mono">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{readingStats.readingTimeMinutes} min read</span>
                  <span className="text-neutral-500">({readingStats.wordCount} words)</span>
                </span>
                <span aria-hidden="true">&middot;</span>
                <span>techstarz101.com</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6 leading-snug">
                {post.title}
              </h1>

              {/* Featured Image */}
              {post.image && (
                <div className="relative my-6 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 group">
                  <img
                    src={post.imageOptimization?.optimizedDataUrl || post.image}
                    alt={post.imageAlt || post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-80 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Floating Optimization Status Badge */}
                  {post.imageOptimization && (
                    <div className="absolute top-3 right-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 rounded-md px-2.5 py-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-lg">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>
                        WebP &bull; {post.imageOptimization.width}&times;{post.imageOptimization.height} &bull; -{post.imageOptimization.savingsPercent}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Introduction Box formatted for techstarz101.com */}
              <div className="my-6 p-4 rounded-r-lg bg-neutral-900/90 border-l-4 border-cyan-400 text-neutral-200 text-sm sm:text-base leading-relaxed">
                <p>{post.introduction}</p>
              </div>

              {/* Dynamic Table of Contents (TOC) with Anchor Jump Links */}
              {toc.length > 0 && (
                <div className="my-6 p-4 rounded-lg bg-neutral-900/70 border border-neutral-800">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-800 text-xs">
                    <span className="font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Table of Contents</span>
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {toc.length} sections &bull; {readingStats.readingTimeMinutes} min
                    </span>
                  </div>
                  <ol className="space-y-1.5 text-xs">
                    {toc.map((item, idx) => (
                      <li key={item.id} className="flex items-baseline gap-2">
                        <span className="text-[11px] font-mono text-neutral-500">{idx + 1}.</span>
                        <a
                          href={item.anchor}
                          onClick={(e) => scrollToAnchor(e, item.id)}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-medium"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Keyword tags */}
              {post.keywords && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-400 my-4 border-b border-neutral-800 pb-3">
                  <span className="text-neutral-400">Keywords:</span>
                  {post.keywords.split(',').map((kw, i) => (
                    <span key={i} className="text-cyan-400/90 font-mono">
                      #{kw.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Article Sections with Anchor IDs */}
              <div className="space-y-8 my-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
                {post.sections.map((section, idx) => {
                  const tocItem = toc[idx] || { id: `section-${idx + 1}` };
                  return (
                    <section key={idx} id={tocItem.id} className="space-y-3 scroll-mt-6">
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight pt-2 flex items-center gap-2 group/h2">
                        <a
                          href={`#${tocItem.id}`}
                          onClick={(e) => scrollToAnchor(e, tocItem.id)}
                          className="text-neutral-500 hover:text-cyan-400 opacity-40 group-hover/h2:opacity-100 transition-opacity font-mono text-base"
                          title="Copy direct section anchor link"
                        >
                          #
                        </a>
                        <span>{section.heading}</span>
                      </h2>
                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="text-neutral-300">
                          {p}
                        </p>
                      ))}
                    </section>
                  );
                })}
              </div>

              {/* Author Profile Information at the end of each blog post */}
              <section className="mt-12 p-5 sm:p-6 rounded-xl border border-neutral-800 bg-neutral-900/80">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/30 shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">
                          {author.name}
                        </h3>
                        <p className="text-xs text-cyan-400 font-mono mt-0.5">
                          {author.role}
                        </p>
                      </div>
                      <button
                        onClick={() => onViewAuthor(author.name)}
                        className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed">
                      {author.bio}
                    </p>

                    {/* Author Social Media Links */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-800 text-xs">
                      <span className="text-neutral-400 text-[11px]">Follow:</span>
                      {author.socialLinks?.twitter && (
                        <a
                          href={author.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          <Twitter className="w-3 h-3" />
                          <span>Twitter/X</span>
                        </a>
                      )}
                      {author.socialLinks?.linkedin && (
                        <a
                          href={author.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          <Linkedin className="w-3 h-3" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {author.socialLinks?.github && (
                        <a
                          href={author.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-neutral-400 hover:text-white"
                        >
                          <Github className="w-3 h-3" />
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Posts Section */}
              <section className="mt-8 pt-6 border-t border-neutral-800">
                <h3 className="text-sm font-bold text-white mb-3">
                  Related Engineering Articles
                </h3>
                <ul className="space-y-2">
                  {post.relatedPosts.map((rel, idx) => (
                    <li key={idx}>
                      <span className="text-xs text-cyan-400 hover:underline cursor-pointer">
                        &rarr; {rel.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </article>
          </main>

          {/* Mock Browser Footer */}
          <footer className="border-t border-neutral-800 px-6 py-4 bg-neutral-950 text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>&copy; 2025 techstarz101.com. All rights reserved.</div>
            <div className="flex items-center gap-3">
              <span className="hover:text-white cursor-pointer">Privacy</span>
              <span className="hover:text-white cursor-pointer">Terms</span>
              <span className="hover:text-cyan-400 cursor-pointer flex items-center gap-1 font-mono text-[11px]">
                <Rss className="w-3 h-3 text-amber-400" />
                <span>feed.xml</span>
              </span>
              <span className="hover:text-cyan-400 cursor-pointer font-mono text-[11px]">
                sitemap.xml
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
