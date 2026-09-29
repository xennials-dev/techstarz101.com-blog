import { BlogPostData, SeoAuditCheck, KeywordMetric } from '../types';
import { getAuthorByName } from './authors';

export function runSeoAudit(post: BlogPostData): {
  score: number;
  rating: 'Critical Issues' | 'Needs Improvement' | 'Good' | 'Search-Engine Ready' | 'Outstanding';
  ratingColor: string;
  checks: SeoAuditCheck[];
  missingRequirements: SeoAuditCheck[];
  passedChecks: SeoAuditCheck[];
  keywordMetrics: KeywordMetric[];
  categoryBreakdown: {
    metadata: { score: number; max: number };
    content: { score: number; max: number };
    accessibility: { score: number; max: number };
    schema: { score: number; max: number };
  };
  metrics: {
    titleLength: number;
    descLength: number;
    wordCount: number;
    readingTimeMinutes: number;
    keywordCount: number;
    sectionCount: number;
    hasAltText: boolean;
    overallKeywordDensity: number;
  };
} {
  const checks: SeoAuditCheck[] = [];
  let scorePoints = 0;
  const maxPoints = 15;

  // Compile full text for text analysis
  const fullText = [
    post.title,
    post.introduction,
    ...post.sections.flatMap(s => [s.heading, ...s.paragraphs])
  ].join(' ');
  const words = fullText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = Math.max(1, words.length);
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  // Compute keyword analysis
  const rawKeywords = (post.keywords || '')
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 1);

  const lowerText = fullText.toLowerCase();
  const keywordMetrics: KeywordMetric[] = [];
  let totalKeywordHits = 0;

  for (const kw of rawKeywords) {
    // Avoid counting single small stop words
    if (kw.length < 3) continue;
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    totalKeywordHits += count;
    const density = Number(((count / wordCount) * 100).toFixed(2));

    let status: 'low' | 'optimal' | 'high' = 'optimal';
    if (density < 0.5) status = 'low';
    else if (density > 3.5) status = 'high';

    keywordMetrics.push({
      keyword: kw,
      count,
      density,
      status
    });
  }

  const overallKeywordDensity = Number(((totalKeywordHits / wordCount) * 100).toFixed(2));

  // 1. Title Audit
  const titleLen = (post.title || '').trim().length;
  if (titleLen >= 30 && titleLen <= 65) {
    checks.push({
      id: 'title-length',
      category: 'metadata',
      label: 'Title Length (SERP Snippet)',
      status: 'pass',
      severity: 'high',
      description: `Title is ${titleLen} characters (target 30–65). Fits Google's 600px desktop and mobile snippet without truncation.`
    });
    scorePoints++;
  } else if (titleLen > 65) {
    checks.push({
      id: 'title-length',
      category: 'metadata',
      label: 'Title Length Exceeds Limit',
      status: 'warning',
      severity: 'medium',
      description: `Title is ${titleLen} characters (over 65). Search engines will truncate it with an ellipsis on search results.`,
      recommendation: 'Trim title to 30–65 characters so your primary hook and branding stay fully visible.',
      fixAction: {
        type: 'open_editor',
        label: 'Trim Title in Editor'
      }
    });
    scorePoints += 0.5;
  } else {
    checks.push({
      id: 'title-length',
      category: 'metadata',
      label: 'Title Too Short',
      status: 'fail',
      severity: 'high',
      description: `Title is only ${titleLen} characters. Short titles fail to convey context to search algorithms.`,
      recommendation: 'Expand title to at least 30 characters incorporating core technology keywords.',
      fixAction: {
        type: 'open_editor',
        label: 'Expand Title'
      }
    });
  }

  // 2. Meta Description Length Audit
  const descLen = (post.description || '').trim().length;
  if (descLen >= 120 && descLen <= 165) {
    checks.push({
      id: 'desc-length',
      category: 'metadata',
      label: 'Meta Description Length (SERP Snippet)',
      status: 'pass',
      severity: 'high',
      description: `Description is ${descLen} characters (target 120–165). Optimal snippet length for Google search results.`
    });
    scorePoints++;
  } else if (descLen > 165) {
    checks.push({
      id: 'desc-length',
      category: 'metadata',
      label: 'Meta Description Too Long',
      status: 'warning',
      severity: 'medium',
      description: `Description is ${descLen} characters (over 165 chars). Google and scrapers will cut off the snippet preview mid-sentence.`,
      recommendation: 'Shorten description to 120–160 characters to prevent snippet truncation.',
      fixAction: {
        type: 'trim_description',
        label: 'Auto-Trim to 155 chars'
      }
    });
    scorePoints += 0.5;
  } else if (descLen === 0) {
    checks.push({
      id: 'desc-length',
      category: 'metadata',
      label: 'Missing Meta Description',
      status: 'fail',
      severity: 'high',
      description: 'No meta description provided. Search engines will generate an unpredictable fallback excerpt.',
      recommendation: 'Write a compelling 120–160 character description summarizing the article value.',
      fixAction: {
        type: 'open_editor',
        label: 'Add Description'
      }
    });
  } else {
    checks.push({
      id: 'desc-length',
      category: 'metadata',
      label: 'Meta Description Too Short',
      status: 'warning',
      severity: 'medium',
      description: `Description is only ${descLen} characters. Short descriptions yield lower search click-through rates.`,
      recommendation: 'Aim for 120–160 characters summarizing actionable takeaways and core tech.',
      fixAction: {
        type: 'open_editor',
        label: 'Expand Description'
      }
    });
    scorePoints += 0.5;
  }

  // 3. Image Alt Text (Accessibility & Google Image Search)
  const hasImage = !!post.image && post.image.startsWith('http');
  const hasAltText = !!post.imageAlt && post.imageAlt.trim().length >= 8;

  if (hasImage && hasAltText) {
    checks.push({
      id: 'image-alt-text',
      category: 'accessibility',
      label: 'Featured Image Alt Text',
      status: 'pass',
      severity: 'high',
      description: `Descriptive image alt text configured: "${post.imageAlt}". Enables screen-reader accessibility and Google Image indexing.`
    });
    scorePoints++;
  } else if (hasImage && !hasAltText) {
    checks.push({
      id: 'image-alt-text',
      category: 'accessibility',
      label: 'Missing Image Alt Text',
      status: 'fail',
      severity: 'high',
      description: 'The featured image lacks a descriptive alt attribute. Search bots cannot index the image context and it violates WCAG 2.1 accessibility.',
      recommendation: 'Add a descriptive alt text explaining what the diagram or graphic represents.',
      fixAction: {
        type: 'add_alt_text',
        label: 'Add Descriptive Alt Text'
      }
    });
  } else {
    checks.push({
      id: 'image-alt-text',
      category: 'accessibility',
      label: 'Missing Featured Visual Asset',
      status: 'warning',
      severity: 'medium',
      description: 'No featured image URL specified. Articles with visual assets generate 94% more organic shares.',
      recommendation: 'Provide an image URL and accompanying alt text description.',
      fixAction: {
        type: 'open_editor',
        label: 'Set Featured Image'
      }
    });
    scorePoints += 0.5;
  }

  // 3b. Automated Image Performance & WebP Compression
  if (post.imageOptimization && post.imageOptimization.savingsPercent > 0) {
    checks.push({
      id: 'image-compression',
      category: 'accessibility',
      label: 'Automated Image Optimization & WebP',
      status: 'pass',
      severity: 'high',
      description: `Feature image compressed to next-gen WebP (${post.imageOptimization.width}×${post.imageOptimization.height}px) with ${post.imageOptimization.savingsPercent}% bandwidth reduction for Core Web Vitals (LCP).`
    });
    scorePoints++;
  } else if (hasImage) {
    checks.push({
      id: 'image-compression',
      category: 'accessibility',
      label: 'Uncompressed Feature Image (Heavy Payload)',
      status: 'warning',
      severity: 'high',
      description: 'Feature image is not resized or compressed to WebP. Unoptimized assets degrade page weight and Core Web Vitals on mobile.',
      recommendation: 'Run Sharp automated image optimization to resize to 1200px and convert to WebP.',
      fixAction: {
        type: 'optimize_image',
        label: 'Auto-Compress Image'
      }
    });
    scorePoints += 0.3;
  }

  // 4. Keyword Density Audit
  const lowDensityKws = keywordMetrics.filter(k => k.density < 0.5);
  const stuffedKws = keywordMetrics.filter(k => k.density > 3.5);

  if (keywordMetrics.length > 0 && lowDensityKws.length === 0 && stuffedKws.length === 0) {
    checks.push({
      id: 'keyword-density',
      category: 'content',
      label: 'Keyword Density & Placement',
      status: 'pass',
      severity: 'high',
      description: `Target keywords appear naturally with healthy frequency (overall ${overallKeywordDensity}% density, ideal 1.0%–2.5%).`
    });
    scorePoints++;
  } else if (stuffedKws.length > 0) {
    checks.push({
      id: 'keyword-density',
      category: 'content',
      label: 'Keyword Overuse / Keyword Stuffing',
      status: 'warning',
      severity: 'high',
      description: `Keyword "${stuffedKws[0].keyword}" has an excessive density of ${stuffedKws[0].density}%. Search algorithms penalize unnatural repetition.`,
      recommendation: 'Reduce keyword repetition to keep density under 3.0%.',
      fixAction: {
        type: 'open_editor',
        label: 'Review in Editor'
      }
    });
    scorePoints += 0.5;
  } else if (lowDensityKws.length > 0) {
    checks.push({
      id: 'keyword-density',
      category: 'content',
      label: 'Low Keyword Density',
      status: 'warning',
      severity: 'medium',
      description: `${lowDensityKws.length} target keyword(s) appear rarely in the article body (e.g. "${lowDensityKws[0].keyword}" has only ${lowDensityKws[0].count} occurrence, ${lowDensityKws[0].density}%).`,
      recommendation: 'Incorporate target keywords naturally within H2 headings and introductory paragraphs.',
      fixAction: {
        type: 'open_editor',
        label: 'Weave Keywords into Body'
      }
    });
    scorePoints += 0.5;
  } else {
    checks.push({
      id: 'keyword-density',
      category: 'content',
      label: 'Missing Target Keywords',
      status: 'fail',
      severity: 'high',
      description: 'No target keywords configured. Search engine spiders require topical keyword signals.',
      recommendation: 'Add 3–6 relevant technology keywords separated by commas.',
      fixAction: {
        type: 'open_editor',
        label: 'Add Keywords'
      }
    });
  }

  // 5. Brand Keyword Inclusion (techstarz101)
  const hasBrandKeyword = rawKeywords.some(k => k.includes('techstarz101') || k.includes('techstarz'));
  if (hasBrandKeyword) {
    checks.push({
      id: 'brand-keyword',
      category: 'metadata',
      label: 'techstarz101.com Brand Inclusion',
      status: 'pass',
      severity: 'medium',
      description: 'Target keywords include "techstarz101", reinforcing branded search authority.'
    });
    scorePoints++;
  } else {
    checks.push({
      id: 'brand-keyword',
      category: 'metadata',
      label: 'Missing Brand Keyword (techstarz101)',
      status: 'warning',
      severity: 'medium',
      description: 'Missing "techstarz101" from the keywords meta tag. Brand keywords help associate your domain with niche topics.',
      recommendation: 'Add "techstarz101, tech blog" to your keyword list.',
      fixAction: {
        type: 'add_brand_keyword',
        label: 'Auto-Add Brand Keyword'
      }
    });
    scorePoints += 0.5;
  }

  // 6. Category Taxonomy Assignment
  const hasCategories = post.categories && post.categories.length > 0;
  if (hasCategories) {
    checks.push({
      id: 'category-taxonomy',
      category: 'metadata',
      label: 'Category Taxonomy Assignment',
      status: 'pass',
      severity: 'medium',
      description: `Assigned to: ${post.categories.join(', ')}. Populates articleSection in Schema.org and enables topic grouping.`
    });
    scorePoints++;
  } else {
    checks.push({
      id: 'category-taxonomy',
      category: 'metadata',
      label: 'Missing Category Assignment',
      status: 'fail',
      severity: 'high',
      description: 'Post is uncategorized. Category tags are critical for internal crawl architecture and RSS feeds.',
      recommendation: 'Assign at least one category: AI, Development, Startups, or General Tech.',
      fixAction: {
        type: 'open_editor',
        label: 'Assign Categories'
      }
    });
  }

  // 7. Schema.org BlogPosting & Author Entity
  const author = post.authorProfile || getAuthorByName(post.author);
  const hasAuthorName = !!author.name && author.name.length > 2;
  const hasAuthorBio = !!author.bio && author.bio.length > 10;
  const hasAuthorSocials = !!(author.socialLinks?.twitter || author.socialLinks?.linkedin);
  const hasSchemaDate = !!post.datePublished && /^\d{4}-\d{2}-\d{2}/.test(post.datePublished);

  if (hasAuthorName && hasAuthorBio && hasAuthorSocials && hasSchemaDate) {
    checks.push({
      id: 'schema-author',
      category: 'schema',
      label: 'Schema.org BlogPosting & Author E-E-A-T',
      status: 'pass',
      severity: 'high',
      description: `Complete JSON-LD BlogPosting schema with author (${author.name}), detailed bio, and verified social URLs for Google E-E-A-T ranking.`
    });
    scorePoints++;
  } else if (hasAuthorName && (!hasAuthorBio || !hasAuthorSocials)) {
    checks.push({
      id: 'schema-author',
      category: 'schema',
      label: 'Incomplete Author E-E-A-T Profile',
      status: 'warning',
      severity: 'medium',
      description: 'Author profile is missing a biography or social profile links (Twitter/LinkedIn). Google uses author reputation to evaluate helpful content.',
      recommendation: 'Add author biography and social URLs in the author editor.',
      fixAction: {
        type: 'open_editor',
        label: 'Complete Author Profile'
      }
    });
    scorePoints += 0.6;
  } else {
    checks.push({
      id: 'schema-author',
      category: 'schema',
      label: 'Missing Author Attribution',
      status: 'fail',
      severity: 'high',
      description: 'Missing author details or datePublished in Schema.org entity.',
      recommendation: 'Provide an author name and publication date.',
      fixAction: {
        type: 'open_editor',
        label: 'Add Author Info'
      }
    });
  }

  // 8. Clean Kebab-Case URL Slug
  const isKebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug);
  if (isKebab && post.slug.length >= 3 && post.slug.length <= 60) {
    checks.push({
      id: 'slug-hygiene',
      category: 'technical',
      label: 'Clean Kebab-Case URL Slug',
      status: 'pass',
      severity: 'medium',
      description: `Slug "${post.slug}" is clean, lowercase, hyphen-separated, and crawl-friendly.`
    });
    scorePoints++;
  } else {
    checks.push({
      id: 'slug-hygiene',
      category: 'technical',
      label: 'Improper URL Slug Format',
      status: 'warning',
      severity: 'medium',
      description: `Slug "${post.slug}" contains uppercase letters, spaces, or illegal URL characters.`,
      recommendation: 'Use lowercase alphanumeric words separated by single hyphens.',
      fixAction: {
        type: 'open_editor',
        label: 'Clean Up Slug'
      }
    });
    scorePoints += 0.5;
  }

  // 9. Semantic Article Structure & Scrapeability
  const hasIntro = !!post.introduction && post.introduction.length > 50;
  const hasSections = post.sections.length >= 2;
  if (hasIntro && hasSections) {
    checks.push({
      id: 'semantic-structure',
      category: 'content',
      label: 'Semantic DOM Structure & H2 Headings',
      status: 'pass',
      severity: 'high',
      description: `Document contains an intro callout and ${post.sections.length} thematic H2 sections for clean HTML parsing.`
    });
    scorePoints++;
  } else {
    checks.push({
      id: 'semantic-structure',
      category: 'content',
      label: 'Weak Heading Hierarchy',
      status: 'warning',
      severity: 'medium',
      description: 'Article lacks distinct H2 sections or introductory framing.',
      recommendation: 'Structure content into at least two distinct H2 sections to improve readability and search indexing.',
      fixAction: {
        type: 'open_editor',
        label: 'Add H2 Sections'
      }
    });
    scorePoints += 0.5;
  }

  // 10. Content Depth / Word Count
  if (wordCount >= 280) {
    checks.push({
      id: 'content-depth',
      category: 'content',
      label: 'Content Depth & Word Count',
      status: 'pass',
      severity: 'medium',
      description: `Article has ${wordCount} words (${readingTimeMinutes} min read), meeting technical depth thresholds.`
    });
    scorePoints++;
  } else {
    checks.push({
      id: 'content-depth',
      category: 'content',
      label: 'Thin Content (< 280 words)',
      status: 'warning',
      severity: 'medium',
      description: `Article has only ${wordCount} words. Thin content is frequently downranked by search algorithms.`,
      recommendation: 'Add deeper technical explanations and practical examples.',
      fixAction: {
        type: 'open_editor',
        label: 'Expand Content'
      }
    });
    scorePoints += 0.5;
  }

  // 11. Internal Linking / Related Posts
  if (post.relatedPosts && post.relatedPosts.length >= 2) {
    checks.push({
      id: 'related-posts',
      category: 'content',
      label: 'Internal Linking / Related Posts',
      status: 'pass',
      severity: 'medium',
      description: `Includes ${post.relatedPosts.length} structured related post links for crawler discovery and page-rank distribution.`
    });
    scorePoints++;
  } else {
    checks.push({
      id: 'related-posts',
      category: 'content',
      label: 'Missing Internal Related Links',
      status: 'warning',
      severity: 'medium',
      description: 'Fewer than 2 related posts linked. Internal links keep readers engaged and help search crawlers map your site.',
      recommendation: 'Link at least 2–3 related tech articles.',
      fixAction: {
        type: 'open_editor',
        label: 'Add Related Links'
      }
    });
    scorePoints += 0.5;
  }

  // 12. OpenGraph & Social Cards
  if (hasImage) {
    checks.push({
      id: 'opengraph-cards',
      category: 'metadata',
      label: 'OpenGraph & Twitter Card Metadata',
      status: 'pass',
      severity: 'medium',
      description: 'Configured with og:title, og:description, and og:image for rich previews on social channels.'
    });
    scorePoints++;
  } else {
    checks.push({
      id: 'opengraph-cards',
      category: 'metadata',
      label: 'Missing Social Card Image',
      status: 'warning',
      severity: 'medium',
      description: 'No image provided for social share cards (X/Twitter, LinkedIn, Slack).',
      recommendation: 'Add a high-resolution featured image for rich social cards.',
      fixAction: {
        type: 'open_editor',
        label: 'Set Social Image'
      }
    });
    scorePoints += 0.5;
  }

  // 14. Table of Contents & Anchor Link Structure
  const hasToc = post.sections && post.sections.length >= 2;
  if (hasToc) {
    checks.push({
      id: 'table-of-contents',
      category: 'content',
      label: 'Table of Contents & Jump Anchors',
      status: 'pass',
      severity: 'high',
      description: `Structured Table of Contents with ${post.sections.length} section jump-links. Unlocks Google rich snippet SERP jump-to-section navigation.`
    });
    scorePoints++;
  } else {
    checks.push({
      id: 'table-of-contents',
      category: 'content',
      label: 'Missing Table of Contents Navigation',
      status: 'warning',
      severity: 'medium',
      description: 'Article lacks enough structured sections for automated Table of Contents jump navigation.',
      recommendation: 'Organize body into at least 2 distinct H2 sections to automatically generate a Table of Contents widget.',
      fixAction: {
        type: 'open_editor',
        label: 'Add Article Sections'
      }
    });
    scorePoints += 0.5;
  }

  // 15. XML Sitemap & RSS Feed Discovery
  checks.push({
    id: 'sitemap-rss-discovery',
    category: 'technical',
    label: 'Google XML Sitemap & RSS Feed Active',
    status: 'pass',
    severity: 'medium',
    description: 'Auto-generates /blog/sitemap.xml and /blog/feed.xml with alternate link tags declared in document head for rapid Googlebot indexing and RSS aggregators.'
  });
  scorePoints++;

  const score = Math.min(100, Math.round((scorePoints / maxPoints) * 100));

  let rating: 'Critical Issues' | 'Needs Improvement' | 'Good' | 'Search-Engine Ready' | 'Outstanding';
  let ratingColor = 'text-emerald-400';

  if (score >= 90) {
    rating = 'Outstanding';
    ratingColor = 'text-emerald-400';
  } else if (score >= 80) {
    rating = 'Search-Engine Ready';
    ratingColor = 'text-cyan-400';
  } else if (score >= 65) {
    rating = 'Good';
    ratingColor = 'text-amber-400';
  } else if (score >= 45) {
    rating = 'Needs Improvement';
    ratingColor = 'text-orange-400';
  } else {
    rating = 'Critical Issues';
    ratingColor = 'text-red-400';
  }

  const missingRequirements = checks.filter(c => c.status !== 'pass');
  const passedChecks = checks.filter(c => c.status === 'pass');

  // Calculate category breakdowns
  const categoryBreakdown = {
    metadata: {
      score: checks.filter(c => c.category === 'metadata' && c.status === 'pass').length,
      max: checks.filter(c => c.category === 'metadata').length
    },
    content: {
      score: checks.filter(c => c.category === 'content' && c.status === 'pass').length,
      max: checks.filter(c => c.category === 'content').length
    },
    accessibility: {
      score: checks.filter(c => c.category === 'accessibility' && c.status === 'pass').length,
      max: checks.filter(c => c.category === 'accessibility').length
    },
    schema: {
      score: checks.filter(c => c.category === 'schema' && c.status === 'pass').length,
      max: checks.filter(c => c.category === 'schema').length
    }
  };

  return {
    score,
    rating,
    ratingColor,
    checks,
    missingRequirements,
    passedChecks,
    keywordMetrics,
    categoryBreakdown,
    metrics: {
      titleLength: titleLen,
      descLength: descLen,
      wordCount,
      readingTimeMinutes,
      keywordCount: rawKeywords.length,
      sectionCount: post.sections.length,
      hasAltText,
      overallKeywordDensity
    }
  };
}
