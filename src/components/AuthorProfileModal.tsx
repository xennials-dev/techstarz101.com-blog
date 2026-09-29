import React from 'react';
import { X, Twitter, Linkedin, Github, Globe, FileText, ArrowUpRight, User, BookOpen } from 'lucide-react';
import { AuthorProfile, BlogPostData } from '../types';

interface AuthorProfileModalProps {
  author: AuthorProfile;
  authorPosts: BlogPostData[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (postId: string) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  author,
  authorPosts,
  isOpen,
  onClose,
  onSelectPost
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Author Profile &bull; techstarz101.com</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Author Bio Header Card */}
        <div className="p-6 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/40 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white leading-tight">{author.name}</h3>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">{author.role}</p>
              <p className="text-xs text-neutral-300 mt-2 leading-relaxed">{author.bio}</p>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-800/80">
            <span className="text-xs font-medium text-neutral-400">Profiles:</span>
            {author.socialLinks.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-950 hover:bg-neutral-800 hover:text-cyan-400 rounded border border-neutral-800 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Twitter / X</span>
              </a>
            )}
            {author.socialLinks.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-950 hover:bg-neutral-800 hover:text-cyan-400 rounded border border-neutral-800 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
                <span>LinkedIn</span>
              </a>
            )}
            {author.socialLinks.github && (
              <a
                href={author.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-950 hover:bg-neutral-800 hover:text-cyan-400 rounded border border-neutral-800 transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-neutral-300" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>

        {/* List of their blog posts */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">
                Articles by {author.name}
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              {authorPosts.length} {authorPosts.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {authorPosts.length === 0 ? (
              <div className="p-4 rounded-lg bg-neutral-950 text-center text-xs text-neutral-400">
                No articles published by this author yet.
              </div>
            ) : (
              authorPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    onSelectPost(post.id);
                    onClose();
                  }}
                  className="p-3 rounded-lg bg-neutral-950 hover:bg-neutral-850 border border-neutral-800/80 hover:border-cyan-500/40 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400 font-mono">
                      <span>{post.datePublished}</span>
                      <span>&bull;</span>
                      <span className="text-cyan-400">
                        {post.categories ? post.categories.join(', ') : 'General Tech'}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
