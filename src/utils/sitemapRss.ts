import { BlogPostData } from '../types';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate standard XML Sitemap compliant with sitemaps.org schema
 * Used by Googlebot, Bingbot, and search engines for fast indexing.
 */
export function generateSitemapXml(posts: BlogPostData[]): string {
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `  <url>
    <loc>https://techstarz101.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    `  <url>
    <loc>https://techstarz101.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
  ];

  for (const post of posts) {
    const lastMod = post.dateModified || post.datePublished || today;
    urls.push(`  <url>
    <loc>https://techstarz101.com/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${escapeXml(lastMod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

/**
 * Generate standard RSS 2.0 Feed with Atom namespace
 * Allows tech newsletters, RSS aggregators, and scrapers to syndicate techstarz101.com articles.
 */
export function generateRssFeedXml(posts: BlogPostData[]): string {
  const nowUtc = new Date().toUTCString();

  const items = posts.map(post => {
    let pubDateUtc = nowUtc;
    try {
      pubDateUtc = new Date(post.datePublished).toUTCString();
    } catch {
      pubDateUtc = nowUtc;
    }

    const categoriesXml = (post.categories || ['General Tech'])
      .map(c => `      <category>${escapeXml(c)}</category>`)
      .join('\n');

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://techstarz101.com/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">https://techstarz101.com/blog/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.description)}</description>
      <author>${escapeXml(post.author)}</author>
${categoriesXml}
      <pubDate>${pubDateUtc}</pubDate>
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>techstarz101.com - Tech Blog &amp; Systems Architecture</title>
    <link>https://techstarz101.com/blog</link>
    <description>Engineering articles covering AI, Development, Startups, and General Tech on techstarz101.com.</description>
    <language>en-us</language>
    <lastBuildDate>${nowUtc}</lastBuildDate>
    <atom:link href="https://techstarz101.com/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>`;
}
