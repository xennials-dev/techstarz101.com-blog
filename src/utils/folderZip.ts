import JSZip from 'jszip';
import { ScrapedPostItem } from '../types';
import { generateSitemapXml, generateRssFeedXml } from './sitemapRss';

function extractBase64Data(dataUrl?: string): string | null {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  return match ? match[1] : null;
}

export async function downloadPostFolderZip(post: ScrapedPostItem): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(`blog/${post.data.slug}`);

  if (folder) {
    folder.file('index.html', post.files.html);
    folder.file('article.md', post.files.markdown);
    folder.file('schema.json', JSON.stringify(post.files.schema, null, 2));
    folder.file('metadata.json', JSON.stringify(post.files.metadata, null, 2));

    // Include the compressed & optimized image in the folder if available
    const base64Image = extractBase64Data(post.data.imageOptimization?.optimizedDataUrl);
    if (base64Image) {
      folder.file('featured-image.webp', base64Image, { base64: true });
    }

    // Include standalone sitemap.xml and feed.xml entry
    const sitemapXml = post.files.sitemapXml || generateSitemapXml([post.data]);
    const rssXml = post.files.rssXml || generateRssFeedXml([post.data]);
    folder.file('sitemap.xml', sitemapXml);
    folder.file('feed.xml', rssXml);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `blog-${post.data.slug}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

export async function downloadAllBlogFoldersZip(posts: ScrapedPostItem[]): Promise<void> {
  const zip = new JSZip();
  const rootBlog = zip.folder('blog');

  const allPostsData = posts.map(p => p.data);
  const sitemapXml = generateSitemapXml(allPostsData);
  const rssXml = generateRssFeedXml(allPostsData);

  const sitemapHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Blog Archive & Directory | techstarz101.com</title>
  <link rel="alternate" type="application/rss+xml" title="techstarz101.com RSS Feed" href="./feed.xml">
  <link rel="sitemap" type="application/xml" title="Sitemap" href="./sitemap.xml">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 820px; margin: 2.5rem auto; padding: 0 1.5rem; background: #09090b; color: #f4f4f5; line-height: 1.6; }
    h1 { color: #ffffff; margin-bottom: 0.5rem; font-size: 1.8rem; }
    a { color: #38bdf8; text-decoration: none; }
    a:hover { text-decoration: underline; color: #06b6d4; }
    .badge { background: #18181b; border: 1px solid #27272a; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; color: #a1a1aa; }
    .meta { font-size: 0.85rem; color: #a1a1aa; margin-bottom: 2rem; }
    ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
    li { background: #121215; border: 1px solid #27272a; padding: 1rem 1.25rem; border-radius: 8px; }
    .rss-links { display: flex; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #27272a; font-size: 0.85rem; }
  </style>
</head>
<body>
  <h1>techstarz101.com &mdash; Static Blog Archive</h1>
  <p class="meta">Static distribution hierarchy generated on ${new Date().toISOString().split('T')[0]} &bull; ${posts.length} articles</p>
  <ul>
    ${posts
      .map(
        p => `<li>
      <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.25rem;"><a href="./${p.data.slug}/index.html">${p.data.title}</a></div>
      <div style="font-size: 0.85rem; color: #a1a1aa;">By ${p.data.author} &bull; <span class="badge">/blog/${p.data.slug}</span> &bull; [${(p.data.categories || ['General Tech']).join(', ')}]</div>
    </li>`
      )
      .join('\n    ')}
  </ul>
  <div class="rss-links">
    <a href="./sitemap.xml">&rarr; Machine-readable XML Sitemap (Googlebot)</a>
    <a href="./feed.xml">&rarr; RSS 2.0 Syndication Feed (Subscribers / Aggregators)</a>
  </div>
</body>
</html>`;

  if (rootBlog) {
    rootBlog.file('index.html', sitemapHtml);
    rootBlog.file('sitemap.xml', sitemapXml);
    rootBlog.file('feed.xml', rssXml);

    for (const post of posts) {
      const postFolder = rootBlog.folder(post.data.slug);
      if (postFolder) {
        postFolder.file('index.html', post.files.html);
        postFolder.file('article.md', post.files.markdown);
        postFolder.file('schema.json', JSON.stringify(post.files.schema, null, 2));
        postFolder.file('metadata.json', JSON.stringify(post.files.metadata, null, 2));

        // Include compressed webp image
        const base64Image = extractBase64Data(post.data.imageOptimization?.optimizedDataUrl);
        if (base64Image) {
          postFolder.file('featured-image.webp', base64Image, { base64: true });
        }
      }
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `techstarz101-blog-archive.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

export function downloadSingleFile(filename: string, contentText: string, mimeType: string = 'text/html'): void {
  const blob = new Blob([contentText], { type: mimeType });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
