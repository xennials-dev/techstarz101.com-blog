import { AuthorProfile, BlogPostData } from '../types';

export const DEFAULT_AUTHORS: AuthorProfile[] = [
  {
    id: 'author-marcus',
    name: 'Marcus Vance',
    slug: 'marcus-vance',
    role: 'Principal AI Architect & Researcher',
    bio: 'Specializing in distributed LLM orchestration, edge inference runtimes, and neuro-symbolic systems. Author of several open-source agent tooling libraries.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    socialLinks: {
      twitter: 'https://twitter.com/marcusvance_ai',
      linkedin: 'https://linkedin.com/in/marcusvance-ai',
      github: 'https://github.com/marcusvance'
    }
  },
  {
    id: 'author-elena',
    name: 'Elena Rostova',
    slug: 'elena-rostova',
    role: 'Staff Infrastructure & Systems Engineer',
    bio: 'Veteran technologist bridging bare-metal hardware intuition with cloud-native distributed architecture. Writes about memory models, low-latency queues, and systems culture.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    socialLinks: {
      twitter: 'https://twitter.com/erostova_tech',
      linkedin: 'https://linkedin.com/in/elena-rostova',
      website: 'https://techstarz101.com/authors/elena-rostova'
    }
  },
  {
    id: 'author-david',
    name: 'David Chen',
    slug: 'david-chen',
    role: 'Startup Advisor & Distributed Systems Lead',
    bio: 'Former YC founder and systems engineer. Focused on scaling event-driven architectures, transactional outboxes, and high-throughput databases under intense spike traffic.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    socialLinks: {
      twitter: 'https://twitter.com/davidchen_sys',
      linkedin: 'https://linkedin.com/in/davidchen-infra',
      github: 'https://github.com/davidchen'
    }
  },
  {
    id: 'author-alex',
    name: 'Alex Rivera',
    slug: 'alex-rivera',
    role: 'Senior Developer Advocate & Tech Writer',
    bio: 'Full-stack builder passionate about developer experience, modern TypeScript tooling, and translating complex engineering paradigms into accessible blueprints.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    socialLinks: {
      twitter: 'https://twitter.com/alexrivera_dev',
      linkedin: 'https://linkedin.com/in/alex-rivera-tech'
    }
  }
];

export function getAuthorById(id?: string): AuthorProfile {
  return DEFAULT_AUTHORS.find(a => a.id === id) || DEFAULT_AUTHORS[0];
}

export function getAuthorByName(name?: string): AuthorProfile {
  if (!name) return DEFAULT_AUTHORS[0];
  const found = DEFAULT_AUTHORS.find(
    a => a.name.toLowerCase() === name.toLowerCase()
  );
  if (found) return found;
  return {
    id: `author-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    role: 'Staff Contributor',
    bio: `Tech contributor at techstarz101.com covering modern architecture, engineering standards, and industry breakthroughs.`,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    socialLinks: {
      twitter: `https://twitter.com/${name.toLowerCase().replace(/\s+/g, '')}`,
      linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`
    }
  };
}

export function getPostsByAuthor(posts: BlogPostData[], authorName: string): BlogPostData[] {
  return posts.filter(
    p => p.author.toLowerCase() === authorName.toLowerCase()
  );
}
