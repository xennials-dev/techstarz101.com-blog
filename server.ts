import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '25mb' }));

// Helper to sanitize slug
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'new-blog-post';
}

// Basic HTML entity decoder
function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Extract meta tag content
function extractMeta(html: string, nameOrProperty: string): string {
  const regexes = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProperty}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${nameOrProperty}["']`, 'i'),
  ];
  for (const regex of regexes) {
    const match = html.match(regex);
    if (match && match[1]) {
      return decodeHtml(match[1].trim());
    }
  }
  return '';
}

// Infer category from text/keywords
function inferCategories(text: string): ('AI' | 'Development' | 'Startups' | 'General Tech')[] {
  const lower = text.toLowerCase();
  const cats: ('AI' | 'Development' | 'Startups' | 'General Tech')[] = [];

  if (/ai|artificial intelligence|llm|agent|gpt|neural|inference|machine learning|model/.test(lower)) {
    cats.push('AI');
  }
  if (/developer|code|software|api|typescript|python|react|frontend|backend|architecture|git|database/.test(lower)) {
    cats.push('Development');
  }
  if (/startup|founder|funding|saas|scale|product market fit|venture|business|growth/.test(lower)) {
    cats.push('Startups');
  }
  if (cats.length === 0) {
    cats.push('General Tech');
  }
  return cats;
}

// Automated Image Optimization function using sharp
async function optimizeImageFromUrl(
  imageUrl: string,
  options: { maxWidth?: number; quality?: number; format?: 'webp' | 'jpeg' | 'png' } = {}
) {
  try {
    const maxWidth = options.maxWidth || 1200;
    const quality = options.quality || 80;
    const format = options.format || 'webp';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0 Safari/537.36 techstarz101-image-optimizer/1.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Image fetch failed with HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const originalSizeBytes = inputBuffer.length;

    // Process image with Sharp: resize, strip heavy metadata, convert to next-gen WebP
    let pipeline = sharp(inputBuffer).resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: 'inside'
    });

    let outputBuffer: Buffer;
    let info: { width?: number; height?: number };

    if (format === 'webp') {
      const result = await pipeline.webp({ quality, effort: 4 }).toBuffer({ resolveWithObject: true });
      outputBuffer = result.data;
      info = result.info;
    } else if (format === 'jpeg') {
      const result = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer({ resolveWithObject: true });
      outputBuffer = result.data;
      info = result.info;
    } else {
      const result = await pipeline.png({ compressionLevel: 8 }).toBuffer({ resolveWithObject: true });
      outputBuffer = result.data;
      info = result.info;
    }

    const optimizedSizeBytes = outputBuffer.length;
    const savingsPercent = Number(
      Math.max(0, ((originalSizeBytes - optimizedSizeBytes) / originalSizeBytes) * 100).toFixed(1)
    );

    const mimeType = format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const optimizedDataUrl = `data:${mimeType};base64,${outputBuffer.toString('base64')}`;

    return {
      success: true,
      originalUrl: imageUrl,
      optimizedDataUrl,
      format,
      width: info.width,
      height: info.height,
      originalSizeBytes,
      optimizedSizeBytes,
      savingsPercent,
      fileName: `featured-image.${format}`
    };
  } catch (err: any) {
    console.warn(`[Image Optimizer] Optimization failed for ${imageUrl}:`, err.message);
    return null;
  }
}

// Clean and extract basic DOM elements
function extractContentFromHtml(rawHtml: string) {
  // Extract Title
  let title = extractMeta(rawHtml, 'og:title') || extractMeta(rawHtml, 'twitter:title');
  if (!title) {
    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = decodeHtml(titleMatch[1].trim());
    }
  }
  if (title) {
    title = title.split(/\s+[|\-–—]\s+/)[0].trim();
  } else {
    title = 'Untitled Tech Article';
  }

  // Extract Description
  let description = extractMeta(rawHtml, 'description') || extractMeta(rawHtml, 'og:description') || extractMeta(rawHtml, 'twitter:description');
  
  // Extract Author
  let author = extractMeta(rawHtml, 'author') || extractMeta(rawHtml, 'article:author');
  if (!author) {
    const authorMatch = rawHtml.match(/rel=["']author["'][^>]*>([^<]+)<\/a>/i) ||
                        rawHtml.match(/class=["'][^"']*(?:author|byline)[^"']*["'][^>]*>([^<]+)<\//i);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].replace(/by\s+/i, '').trim();
    } else {
      author = 'Marcus Vance';
    }
  }

  // Extract Image and Alt text
  let image = extractMeta(rawHtml, 'og:image') || extractMeta(rawHtml, 'twitter:image');
  let imageAlt = extractMeta(rawHtml, 'og:image:alt') || extractMeta(rawHtml, 'twitter:image:alt');

  if (!image) {
    const imgMatch = rawHtml.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp))["'][^>]*>/i);
    if (imgMatch) {
      image = imgMatch[1];
      const altMatch = imgMatch[0].match(/alt=["']([^"']*)["']/i);
      if (altMatch && altMatch[1]) {
        imageAlt = decodeHtml(altMatch[1].trim());
      }
    } else {
      image = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80';
    }
  }

  if (!imageAlt) {
    imageAlt = `Editorial visual asset for ${title} on techstarz101.com`;
  }

  // Extract Keywords
  let keywords = extractMeta(rawHtml, 'keywords');
  if (!keywords) {
    keywords = 'techstarz101, tech blog, software architecture, modern development, engineering';
  } else if (!keywords.toLowerCase().includes('techstarz101')) {
    keywords = `techstarz101, tech blog, ${keywords}`;
  }

  // Extract Date
  let datePublished = extractMeta(rawHtml, 'article:published_time');
  if (datePublished) {
    try {
      datePublished = new Date(datePublished).toISOString().split('T')[0];
    } catch {
      datePublished = new Date().toISOString().split('T')[0];
    }
  } else {
    datePublished = new Date().toISOString().split('T')[0];
  }

  // Strip scripts, styles, navs, footers, headers
  let cleanHtml = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');

  // Find main content container
  let bodyContent = '';
  const articleMatch = cleanHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch && articleMatch[1].length > 300) {
    bodyContent = articleMatch[1];
  } else {
    const mainMatch = cleanHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch && mainMatch[1].length > 300) {
      bodyContent = mainMatch[1];
    } else {
      bodyContent = cleanHtml;
    }
  }

  // Extract structured paragraphs & headings
  const sections: { heading: string; paragraphs: string[] }[] = [];
  const pMatches = Array.from(bodyContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map(m => decodeHtml(m[1].replace(/<[^>]+>/g, '').trim()))
    .filter(p => p.length > 40);

  if (pMatches.length > 0) {
    if (!description) {
      description = pMatches[0].slice(0, 155) + '...';
    }

    const headings = [
      'Architectural Foundations & Evolution',
      'Key Implementation Principles',
      'Engineering Trade-offs & Production Realities',
      'Future Outlook & Actionable Takeaways'
    ];

    const chunkSize = Math.max(1, Math.ceil(pMatches.length / 4));
    for (let i = 0; i < 4; i++) {
      const slice = pMatches.slice(i * chunkSize, (i + 1) * chunkSize);
      if (slice.length > 0) {
        sections.push({
          heading: headings[i] || `Key Insights Part ${i + 1}`,
          paragraphs: slice.slice(0, 3)
        });
      }
    }
  }

  if (sections.length === 0) {
    sections.push(
      {
        heading: 'The Evolving Landscape',
        paragraphs: [
          'Modern software engineering is at an inflection point where decades of classical systems knowledge meet modern cloud-native architectures.',
          'For seasoned developers who witnessed the transition from bare metal to containers, current patterns demand deliberate architectural discipline.'
        ]
      },
      {
        heading: 'Strategic Implementations & Workflows',
        paragraphs: [
          'Effective teams prioritize composable modular boundaries, low-friction developer workflows, and explicit data lifecycles.',
          'By avoiding fragile abstractions and emphasizing observable state, systems scale predictably without sudden technical debt.'
        ]
      },
      {
        heading: 'Actionable Takeaways for Modern Teams',
        paragraphs: [
          'Audit your service boundaries and simplify dependency graphs to reduce runtime cognitive load.',
          'Invest in end-to-end type safety, automated verification, and clean documentation before accelerating feature delivery.'
        ]
      }
    );
  }

  const slug = createSlug(title);
  const categories = inferCategories(`${title} ${keywords} ${description}`);

  return {
    title,
    slug,
    author,
    categories,
    image,
    imageAlt,
    keywords,
    datePublished,
    dateModified: datePublished,
    description: (description || 'Insights on modern software engineering at techstarz101.com').slice(0, 160),
    introduction: `Welcome to the latest blog post from techstarz101.com! In this article, we’ll explore ${title.toLowerCase()}, diving into the underlying engineering principles, architectural implications, and how it relates to building resilient modern applications. Whether you're an experienced developer or scaling an early-stage startup, this post will provide you with insights and actionable takeaways.`,
    sections,
    authorProfile: {
      id: `author-${author.toLowerCase().replace(/\s+/g, '-')}`,
      name: author,
      slug: author.toLowerCase().replace(/\s+/g, '-'),
      role: 'Staff Contributor & Systems Engineer',
      bio: `${author} is a technology writer and software architect at techstarz101.com, researching distributed computing and modern engineering best practices.`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      socialLinks: {
        twitter: `https://twitter.com/${author.toLowerCase().replace(/\s+/g, '')}`,
        linkedin: `https://linkedin.com/in/${author.toLowerCase().replace(/\s+/g, '-')}`
      }
    },
    relatedPosts: [
      { title: 'AI Trends in 2025: Autonomous Systems', slug: 'ai-trends-in-2025' },
      { title: 'The Modern Engineer: Hardware to Cloud', slug: 'the-modern-engineer' },
      { title: 'Event-Driven Architectures: High Throughput Scaling', slug: 'event-driven-scaling-architectures' }
    ]
  };
}

// In-memory scrape cache for deduplication & fast reuse
interface CacheEntry {
  data: any;
  timestamp: number;
}
const scrapeCache = new Map<string, CacheEntry>();

// Cache management endpoint
app.get('/api/cache', (_req: Request, res: Response) => {
  const entries = Array.from(scrapeCache.entries()).map(([url, entry]) => ({
    url,
    title: entry.data.title,
    slug: entry.data.slug,
    categories: entry.data.categories,
    scrapedAt: new Date(entry.timestamp).toISOString()
  }));
  res.json({ count: entries.length, entries });
});

app.delete('/api/cache', (_req: Request, res: Response) => {
  scrapeCache.clear();
  res.json({ success: true, message: 'Scrape cache cleared.' });
});

// Standalone endpoint: Optimize any Image on-demand
app.post('/api/optimize-image', async (req: Request, res: Response) => {
  try {
    const { imageUrl, maxWidth, quality, format } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing imageUrl parameter.' });
    }

    const result = await optimizeImageFromUrl(imageUrl, {
      maxWidth: maxWidth ? Number(maxWidth) : 1200,
      quality: quality ? Number(quality) : 80,
      format: format || 'webp'
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to optimize image.' });
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Image optimization failed' });
  }
});

// API endpoint: Scrape URL or Raw Content with Automated Image Optimization
app.post('/api/scrape', async (req: Request, res: Response) => {
  try {
    const {
      url,
      rawHtml,
      rawText,
      enrichWithAi,
      categories: userCategories,
      optimizeImage = true
    } = req.body;

    let htmlToParse = '';

    if (url) {
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL provided.' });
      }

      // Check in-memory cache for deduplication
      if (!req.body.forceRefresh && scrapeCache.has(url)) {
        const cached = scrapeCache.get(url)!;
        if (Date.now() - cached.timestamp < 3600000) {
          return res.json({
            success: true,
            fromCache: true,
            cachedAt: new Date(cached.timestamp).toISOString(),
            data: cached.data
          });
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 techstarz101-scraper/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const isBotChallenge = response.status === 403 || response.status === 429 || response.status === 503;
        let domain = 'target website';
        try { domain = new URL(url).hostname; } catch {}
        return res.status(response.status).json({
          error: isBotChallenge
            ? `Anti-Bot / Rate-Limit challenge detected on ${domain} (HTTP ${response.status}).`
            : `Failed to fetch URL (${response.status} ${response.statusText})`,
          antiBotTriggered: isBotChallenge,
          statusCode: response.status,
          domain,
          sourceUrl: url,
          suggestedAction: 'Switch to the 1-Click Anti-Bot Reader view or paste the article content directly.'
        });
      }

      htmlToParse = await response.text();

      // Check if Cloudflare interstitial / challenge was returned with 200 OK
      if (
        htmlToParse.includes('cf-browser-verification') ||
        htmlToParse.includes('Checking your browser before accessing') ||
        htmlToParse.includes('Attention Required! | Cloudflare') ||
        (htmlToParse.includes('Ray ID:') && htmlToParse.includes('Cloudflare'))
      ) {
        let domain = 'target website';
        try { domain = new URL(url).hostname; } catch {}
        return res.status(403).json({
          error: `Cloudflare bot verification challenge encountered for ${domain}.`,
          antiBotTriggered: true,
          statusCode: 403,
          domain,
          sourceUrl: url,
          suggestedAction: 'Paste article HTML or text directly into the raw editor.'
        });
      }
    } else if (rawHtml) {
      htmlToParse = rawHtml;
    } else if (rawText) {
      htmlToParse = `<html><body><article><h1>${rawText.slice(0, 80).split('\n')[0]}</h1><p>${rawText.replace(/\n\n+/g, '</p><p>')}</p></article></body></html>`;
    } else {
      return res.status(400).json({ error: 'No URL or content provided to scrape.' });
    }

    let extracted = extractContentFromHtml(htmlToParse);

    if (userCategories && Array.isArray(userCategories) && userCategories.length > 0) {
      extracted.categories = userCategories;
    }

    // AI enhancement via Gemini
    if (enrichWithAi && process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const prompt = `
You are an expert tech editor for "techstarz101.com", a website covering AI, Development, Startups, and General Tech.
Transform and optimize this extracted blog article into a clean, highly structured, SEO-friendly article following the techstarz101.com format.

Title: ${extracted.title}
Draft Body Excerpt: ${extracted.sections.map(s => s.heading + ': ' + s.paragraphs.join(' ')).join('\n\n').slice(0, 2500)}

Return ONLY valid JSON matching this schema:
{
  "title": "Clear, compelling, un-hyped title (max 65 chars)",
  "slug": "kebab-case-slug-without-symbols",
  "categories": ["AI" or "Development" or "Startups" or "General Tech"],
  "description": "Compelling meta description between 130 and 155 chars summarizing key takeaways",
  "keywords": "techstarz101, tech blog, [3-5 specific technology keywords]",
  "author": "Author name",
  "imageAlt": "Descriptive accessibility alt text for the feature image",
  "introduction": "Engaging introduction paragraph connecting the topic to techstarz101.com readers",
  "sections": [
    {
      "heading": "Descriptive H2 Heading",
      "paragraphs": ["Detailed analytical paragraph 1", "Detailed analytical paragraph 2"]
    }
  ],
  "relatedPosts": [
    {"title": "Related tech topic 1", "slug": "related-slug-1"},
    {"title": "Related tech topic 2", "slug": "related-slug-2"},
    {"title": "Related tech topic 3", "slug": "related-slug-3"}
  ]
}
`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsedAi = JSON.parse(response.text);
          extracted = {
            ...extracted,
            ...parsedAi,
            categories: userCategories || parsedAi.categories || extracted.categories,
            slug: createSlug(parsedAi.slug || parsedAi.title || extracted.slug),
            datePublished: extracted.datePublished,
            dateModified: extracted.dateModified,
            image: extracted.image,
            imageAlt: parsedAi.imageAlt || extracted.imageAlt
          };
        }
      } catch (aiErr) {
        console.warn('AI enhancement fallback to standard scraper:', aiErr);
      }
    }

    // Automated Image Optimization during scraping
    let imageOptimizationInfo = null;
    if (optimizeImage && extracted.image && extracted.image.startsWith('http')) {
      try {
        const optResult = await optimizeImageFromUrl(extracted.image, {
          maxWidth: 1200,
          quality: 80,
          format: 'webp'
        });
        if (optResult && optResult.success) {
          imageOptimizationInfo = optResult;
        }
      } catch (imgErr) {
        console.warn('[Scraper] Image optimization step skipped due to error:', imgErr);
      }
    }

    const finalData = {
      ...extracted,
      imageOptimization: imageOptimizationInfo
    };

    if (url) {
      scrapeCache.set(url, {
        data: finalData,
        timestamp: Date.now()
      });
    }

    return res.json({
      success: true,
      data: finalData
    });
  } catch (err: any) {
    console.error('Scrape error:', err);
    return res.status(500).json({ error: err.message || 'Internal scraping error' });
  }
});

// Vite or Static file serving setup
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`techstarz101.com scraper studio running on http://localhost:${PORT}`);
  });
}

startServer();
