export type Category = 'AI' | 'Development' | 'Startups' | 'General Tech';

export interface AuthorSocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface AuthorProfile {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar: string;
  socialLinks: AuthorSocialLinks;
}

export interface BlogPostSection {
  heading: string;
  paragraphs: string[];
}

export interface TableOfContentItem {
  id: string;
  title: string;
  anchor: string;
}

export interface RelatedPost {
  title: string;
  slug: string;
  categories?: Category[];
}

export interface ImageOptimizationInfo {
  originalUrl: string;
  optimizedDataUrl?: string; // base64 data URL for preview and zip export
  format: 'webp' | 'jpeg' | 'png';
  width: number;
  height: number;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  savingsPercent: number;
  fileName: string; // e.g. "featured-image.webp"
}

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorId?: string;
  authorProfile?: AuthorProfile;
  categories: Category[];
  datePublished: string;
  dateModified: string;
  description: string;
  keywords: string;
  image: string;
  imageAlt?: string;
  imageOptimization?: ImageOptimizationInfo;
  introduction: string;
  sections: BlogPostSection[];
  relatedPosts: RelatedPost[];
  sourceUrl?: string;
  crawledAt?: string;
  readingTimeMinutes?: number;
  wordCount?: number;
  tableOfContents?: TableOfContentItem[];
}

export interface GeneratedFiles {
  folderPath: string;
  html: string;
  markdown: string;
  schema: Record<string, any>;
  metadata: {
    title: string;
    slug: string;
    categories: Category[];
    datePublished: string;
    author: string;
    canonicalUrl: string;
    files: string[];
    readingTimeMinutes?: number;
    wordCount?: number;
    imageOptimization?: {
      format: string;
      originalSizeBytes: number;
      optimizedSizeBytes: number;
      savingsPercent: number;
    };
  };
  sitemapXml?: string;
  rssXml?: string;
}

export type SupportedFileType =
  | 'index.html'
  | 'article.md'
  | 'schema.json'
  | 'metadata.json'
  | 'featured-image.webp'
  | 'sitemap.xml'
  | 'feed.xml';

export interface ScrapedPostItem {
  id: string;
  data: BlogPostData;
  files: GeneratedFiles;
  activeFile: SupportedFileType;
}

export interface SeoAuditCheck {
  id: string;
  category: 'metadata' | 'content' | 'accessibility' | 'schema' | 'technical';
  label: string;
  status: 'pass' | 'warning' | 'fail';
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation?: string;
  fixAction?: {
    type: 'add_brand_keyword' | 'trim_description' | 'expand_description' | 'add_alt_text' | 'optimize_image' | 'add_toc' | 'open_editor';
    label: string;
  };
}

export interface KeywordMetric {
  keyword: string;
  count: number;
  density: number;
  status: 'low' | 'optimal' | 'high';
}

export interface SampleArticle {
  id: string;
  name: string;
  url: string;
  sampleType: string;
  categories: Category[];
  mockData: Omit<BlogPostData, 'id'>;
}

export interface ScrapeCacheEntry {
  url: string;
  scrapedAt: string;
  title: string;
  slug: string;
  categories: Category[];
  postCount?: number;
}

export interface AntiBotFallbackInfo {
  triggered: boolean;
  statusCode?: number;
  domain?: string;
  message?: string;
  sourceUrl?: string;
}
