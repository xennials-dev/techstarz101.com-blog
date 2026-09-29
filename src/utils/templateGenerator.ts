import { BlogPostData, GeneratedFiles, Category, TableOfContentItem } from '../types';
import { getAuthorByName } from './authors';
import { generateSitemapXml, generateRssFeedXml } from './sitemapRss';

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'new-blog-post';
}

export function calculateReadingStats(data: BlogPostData): { readingTimeMinutes: number; wordCount: number } {
  const fullText = [
    data.title || '',
    data.introduction || '',
    ...(data.sections || []).flatMap(s => [s.heading || '', ...(s.paragraphs || [])])
  ].join(' ');
  const words = fullText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return { readingTimeMinutes, wordCount };
}

export function generateTableOfContents(sections: { heading: string; paragraphs: string[] }[]): TableOfContentItem[] {
  return (sections || []).map((sec, idx) => {
    const slugId = createSlug(sec.heading) || `section-${idx + 1}`;
    return {
      id: slugId,
      title: sec.heading,
      anchor: `#${slugId}`
    };
  });
}

export function generateSchema(data: BlogPostData): Record<string, any> {
  const author = data.authorProfile || getAuthorByName(data.author);
  const sameAs: string[] = [];
  if (author.socialLinks?.twitter) sameAs.push(author.socialLinks.twitter);
  if (author.socialLinks?.linkedin) sameAs.push(author.socialLinks.linkedin);
  if (author.socialLinks?.github) sameAs.push(author.socialLinks.github);

  const stats = calculateReadingStats(data);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": data.title,
    "datePublished": data.datePublished || new Date().toISOString().split('T')[0],
    "dateModified": data.dateModified || data.datePublished || new Date().toISOString().split('T')[0],
    "description": data.description,
    "keywords": data.keywords,
    "articleSection": data.categories.length > 0 ? data.categories.join(', ') : 'General Tech',
    "wordCount": stats.wordCount,
    "timeRequired": `PT${stats.readingTimeMinutes}M`,
    "author": {
      "@type": "Person",
      "name": author.name,
      "description": author.bio,
      "url": `https://techstarz101.com/authors/${author.slug}`,
      ...(sameAs.length > 0 ? { "sameAs": sameAs } : {})
    },
    "publisher": {
      "@type": "Organization",
      "name": "techstarz101.com",
      "url": "https://techstarz101.com"
    },
    "image": data.image || "https://techstarz101.com/wp-content/uploads/2025/05/blog-post-image.jpg",
    "url": `https://techstarz101.com/blog/${data.slug}`
  };
}

export function generateHtmlTemplate(data: BlogPostData): string {
  const schema = generateSchema(data);
  const schemaString = JSON.stringify(schema, null, 2);
  const author = data.authorProfile || getAuthorByName(data.author);
  const readingStats = calculateReadingStats(data);
  const toc = generateTableOfContents(data.sections || []);

  const categoriesHtml = (data.categories || ['General Tech'])
    .map(c => `<span class="category-tag">${c}</span>`)
    .join(' <span class="sep" aria-hidden="true">&middot;</span> ');

  const sectionsHtml = (data.sections || [])
    .map((sec, idx) => {
      const tocItem = toc[idx] || { id: `section-${idx + 1}` };
      return `
    <section class="blog-section" id="${tocItem.id}">
      <h2><a href="#${tocItem.id}" class="heading-anchor" aria-label="Direct link to this section">#</a> ${sec.heading}</h2>
      ${sec.paragraphs.map(p => `<p>${p}</p>`).join('\n      ')}
    </section>`;
    })
    .join('\n');

  const relatedPostsHtml = (data.relatedPosts || [])
    .map(post => `      <li><a href="/blog/${post.slug}">${post.title}</a></li>`)
    .join('\n');

  // Author social links HTML
  const socialLinksHtml = [];
  if (author.socialLinks?.twitter) {
    socialLinksHtml.push(`<a href="${author.socialLinks.twitter}" target="_blank" rel="noopener noreferrer" class="author-social-link">Twitter / X</a>`);
  }
  if (author.socialLinks?.linkedin) {
    socialLinksHtml.push(`<a href="${author.socialLinks.linkedin}" target="_blank" rel="noopener noreferrer" class="author-social-link">LinkedIn</a>`);
  }
  if (author.socialLinks?.github) {
    socialLinksHtml.push(`<a href="${author.socialLinks.github}" target="_blank" rel="noopener noreferrer" class="author-social-link">GitHub</a>`);
  }
  if (author.socialLinks?.website) {
    socialLinksHtml.push(`<a href="${author.socialLinks.website}" target="_blank" rel="noopener noreferrer" class="author-social-link">Website</a>`);
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} | techstarz101.com</title>
  <meta name="description" content="${data.description}">
  <meta name="keywords" content="${data.keywords}">
  <meta name="author" content="${author.name}">
  
  <!-- RSS & Sitemap Discovery -->
  <link rel="alternate" type="application/rss+xml" title="techstarz101.com RSS Feed" href="https://techstarz101.com/blog/feed.xml">
  <link rel="sitemap" type="application/xml" title="Sitemap" href="https://techstarz101.com/blog/sitemap.xml">

  <!-- OpenGraph Metadata -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:image" content="${data.image}">
  <meta property="og:url" content="https://techstarz101.com/blog/${data.slug}">
  <meta property="og:site_name" content="techstarz101.com">
  
  <!-- Twitter Card Metadata -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title}">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="${data.image}">
  
  <link rel="canonical" href="https://techstarz101.com/blog/${data.slug}">

  <!-- Structured Data (Schema.org) for Search Engines & Scrapers -->
  <script type="application/ld+json">
${schemaString}
  </script>

  <style>
    :root {
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --color-bg: #09090b;
      --color-surface: #121215;
      --color-border: #27272a;
      --color-text: #f4f4f5;
      --color-text-muted: #a1a1aa;
      --color-accent: #38bdf8;
      --color-accent-hover: #06b6d4;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html {
      scroll-behavior: smooth;
    }
    body {
      font-family: var(--font-sans);
      background-color: var(--color-bg);
      color: var(--color-text);
      line-height: 1.7;
      padding: 0;
      margin: 0;
      -webkit-font-smoothing: antialiased;
    }
    header.site-header {
      border-bottom: 1px solid var(--color-border);
      padding: 1.25rem 1.5rem;
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-logo {
      font-weight: 800;
      font-size: 1.25rem;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .brand-logo span.accent {
      color: var(--color-accent);
    }
    .brand-logo span.sub {
      color: var(--color-text-muted);
      font-weight: 500;
      font-size: 0.95rem;
    }
    main.blog-container {
      max-width: 780px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }
    .post-header {
      margin-bottom: 2rem;
    }
    .post-categories {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }
    .category-tag {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-accent);
    }
    .sep {
      color: var(--color-border);
    }
    .post-meta {
      font-size: 0.875rem;
      color: var(--color-text-muted);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    h1.post-title {
      font-size: 2.35rem;
      line-height: 1.25;
      color: #ffffff;
      margin-bottom: 1rem;
      letter-spacing: -0.03em;
    }
    .featured-image-wrapper {
      margin: 2rem 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
    }
    .featured-image-wrapper img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      max-height: 420px;
    }
    .post-introduction {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #f4f4f5;
      background: var(--color-surface);
      border-left: 3px solid var(--color-accent);
      padding: 1.25rem 1.5rem;
      border-radius: 0 6px 6px 0;
      margin-bottom: 2rem;
    }
    /* Table of Contents */
    .table-of-contents {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      margin: 2rem 0 2.5rem 0;
    }
    .toc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--color-border);
    }
    .toc-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: var(--font-mono);
    }
    .toc-count {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      font-family: var(--font-mono);
    }
    .toc-list {
      margin: 0;
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .toc-list li a {
      color: var(--color-accent);
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.15s ease;
    }
    .toc-list li a:hover {
      color: var(--color-accent-hover);
      text-decoration: underline;
    }
    .heading-anchor {
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 0.85em;
      margin-right: 0.35rem;
      opacity: 0.35;
      transition: opacity 0.15s ease;
    }
    .heading-anchor:hover {
      opacity: 1;
      color: var(--color-accent);
    }
    .blog-section {
      margin-bottom: 2.5rem;
    }
    .blog-section h2 {
      font-size: 1.45rem;
      color: #ffffff;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }
    .blog-section p {
      margin-bottom: 1.25rem;
      color: #d4d4d8;
      font-size: 1.05rem;
    }
    /* Author Profile Card displayed at the end of each blog post */
    .author-card {
      margin-top: 3.5rem;
      padding: 1.75rem;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      background: var(--color-surface);
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .author-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-border);
      shrink: 0;
    }
    .author-info {
      flex: 1;
    }
    .author-header-line {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.35rem;
    }
    .author-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
    }
    .author-role {
      font-size: 0.8rem;
      color: var(--color-accent);
      font-family: var(--font-mono);
    }
    .author-bio {
      font-size: 0.9rem;
      color: #a1a1aa;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .author-socials {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.85rem;
    }
    .author-social-link {
      color: var(--color-accent);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s ease;
    }
    .author-social-link:hover {
      color: var(--color-accent-hover);
      text-decoration: underline;
    }
    .related-posts {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--color-border);
    }
    .related-posts h2 {
      font-size: 1.3rem;
      color: #ffffff;
      margin-bottom: 1.2rem;
      letter-spacing: -0.01em;
    }
    .related-posts ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .related-posts li a {
      color: var(--color-accent);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.15s ease;
    }
    .related-posts li a:hover {
      text-decoration: underline;
      color: var(--color-accent-hover);
    }
    footer.site-footer {
      border-top: 1px solid var(--color-border);
      padding: 2.5rem 1.5rem;
      max-width: 780px;
      margin: 4rem auto 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }
    footer.site-footer a {
      color: var(--color-text-muted);
      text-decoration: none;
    }
    footer.site-footer a:hover { color: #ffffff; }
    .footer-links {
      display: flex;
      gap: 1.25rem;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="site-header">
    <a href="/" class="brand-logo">
      techstarz<span class="accent">101</span><span class="sub">.com</span>
    </a>
    <nav>
      <a href="/blog" style="color: var(--color-text-muted); text-decoration: none; font-size: 0.875rem;">All Posts</a>
    </nav>
  </header>

  <!-- Main Article Body -->
  <main class="blog-container">
    <article itemscope itemtype="https://schema.org/BlogPosting">
      <header class="post-header">
        <div class="post-categories">
          ${categoriesHtml}
        </div>
        <div class="post-meta">
          <span>By ${author.name}</span>
          <span aria-hidden="true">&middot;</span>
          <time datetime="${data.datePublished}">${data.datePublished}</time>
          <span aria-hidden="true">&middot;</span>
          <span>${readingStats.readingTimeMinutes} min read (${readingStats.wordCount} words)</span>
          <span aria-hidden="true">&middot;</span>
          <span>techstarz101.com</span>
        </div>
        <h1 class="post-title" itemprop="headline">${data.title}</h1>
      </header>

      ${
        data.image
          ? `<div class="featured-image-wrapper">
        <img src="${data.image}" alt="${data.imageAlt || data.title}" itemprop="image" loading="lazy">
      </div>`
          : ''
      }

      <div class="post-introduction">
        <p>${data.introduction}</p>
      </div>

      <!-- Dynamic Table of Contents (TOC) with Anchor Links -->
      ${
        toc.length > 0
          ? `<nav class="table-of-contents" aria-label="Table of Contents">
        <div class="toc-header">
          <span class="toc-title">Table of Contents</span>
          <span class="toc-count">${toc.length} sections</span>
        </div>
        <ol class="toc-list">
${toc.map(item => `          <li><a href="${item.anchor}">${item.title}</a></li>`).join('\n')}
        </ol>
      </nav>`
          : ''
      }

      <div class="article-content" itemprop="articleBody">
${sectionsHtml}
      </div>

      <!-- Author Profile Functionality at the end of each post -->
      <section class="author-card" itemprop="author" itemscope itemtype="https://schema.org/Person">
        <img src="${author.avatar}" alt="${author.name}" class="author-avatar" itemprop="image">
        <div class="author-info">
          <div class="author-header-line">
            <h3 class="author-name" itemprop="name">${author.name}</h3>
            <span class="author-role">${author.role}</span>
          </div>
          <p class="author-bio" itemprop="description">${author.bio}</p>
          <div class="author-socials">
            ${socialLinksHtml.join('\n            ')}
          </div>
        </div>
      </section>

      <!-- Related Posts Section (Scraping friendly) -->
      <section class="related-posts">
        <h2>Related Posts</h2>
        <ul>
${relatedPostsHtml}
        </ul>
      </section>
    </article>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <p>&copy; 2025 techstarz101.com. All rights reserved.</p>
    <div class="footer-links">
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
      <a href="/blog/feed.xml">RSS Feed</a>
      <a href="/blog/sitemap.xml">XML Sitemap</a>
    </div>
  </footer>
</body>
</html>`;
}

export function generateMarkdown(data: BlogPostData): string {
  const author = data.authorProfile || getAuthorByName(data.author);
  const readingStats = calculateReadingStats(data);
  const toc = generateTableOfContents(data.sections || []);

  let md = `---
title: "${data.title}"
slug: "${data.slug}"
author: "${data.author}"
datePublished: "${data.datePublished}"
dateModified: "${data.dateModified || data.datePublished}"
categories: [${(data.categories || []).map(c => `"${c}"`).join(', ')}]
readingTimeMinutes: ${readingStats.readingTimeMinutes}
wordCount: ${readingStats.wordCount}
description: "${data.description}"
keywords: "${data.keywords}"
image: "${data.image}"
imageAlt: "${data.imageAlt || ''}"
url: "https://techstarz101.com/blog/${data.slug}"
---

# ${data.title}

*By ${author.name} &bull; ${data.datePublished} &bull; ${readingStats.readingTimeMinutes} min read &bull; techstarz101.com*

> ${data.introduction}

## Table of Contents
${toc.map(item => `- [${item.title}](${item.anchor})`).join('\n')}

`;

  for (const sec of (data.sections || [])) {
    md += `## ${sec.heading}\n\n`;
    for (const p of sec.paragraphs) {
      md += `${p}\n\n`;
    }
  }

  md += `## About the Author: ${author.name}\n\n`;
  md += `${author.bio}\n\n`;
  if (author.socialLinks?.twitter) md += `- Twitter/X: [${author.socialLinks.twitter}](${author.socialLinks.twitter})\n`;
  if (author.socialLinks?.linkedin) md += `- LinkedIn: [${author.socialLinks.linkedin}](${author.socialLinks.linkedin})\n`;

  md += `\n## Related Posts\n\n`;
  for (const rel of (data.relatedPosts || [])) {
    md += `- [${rel.title}](/blog/${rel.slug})\n`;
  }

  return md;
}

export function generateAllFiles(data: BlogPostData, allPosts?: BlogPostData[]): GeneratedFiles {
  const slug = data.slug || createSlug(data.title);
  const categories: Category[] = data.categories && data.categories.length > 0 ? data.categories : ['General Tech'];
  const readingStats = calculateReadingStats(data);
  const toc = generateTableOfContents(data.sections || []);
  const dataEnriched: BlogPostData = {
    ...data,
    slug,
    categories,
    readingTimeMinutes: readingStats.readingTimeMinutes,
    wordCount: readingStats.wordCount,
    tableOfContents: toc
  };

  const schema = generateSchema(dataEnriched);
  const html = generateHtmlTemplate(dataEnriched);
  const markdown = generateMarkdown(dataEnriched);

  const postsForFeed = allPosts && allPosts.length > 0 ? allPosts : [dataEnriched];
  const sitemapXml = generateSitemapXml(postsForFeed);
  const rssXml = generateRssFeedXml(postsForFeed);

  const fileList = ['index.html', 'article.md', 'metadata.json', 'schema.json', 'sitemap.xml', 'feed.xml'];
  if (data.imageOptimization) {
    fileList.push('featured-image.webp');
  }

  return {
    folderPath: `/blog/${slug}`,
    html,
    markdown,
    schema,
    sitemapXml,
    rssXml,
    metadata: {
      title: data.title,
      slug,
      categories,
      datePublished: data.datePublished,
      author: data.author,
      canonicalUrl: `https://techstarz101.com/blog/${slug}`,
      readingTimeMinutes: readingStats.readingTimeMinutes,
      wordCount: readingStats.wordCount,
      files: fileList,
      ...(data.imageOptimization
        ? {
            imageOptimization: {
              format: data.imageOptimization.format,
              originalSizeBytes: data.imageOptimization.originalSizeBytes,
              optimizedSizeBytes: data.imageOptimization.optimizedSizeBytes,
              savingsPercent: data.imageOptimization.savingsPercent
            }
          }
        : {})
    }
  };
}
