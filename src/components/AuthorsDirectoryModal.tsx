import React from 'react';
import { X, Users, Twitter, Linkedin, Github, Globe, BookOpen, ArrowUpRight } from 'lucide-react';
import { AuthorProfile, BlogPostData } from '../types';
import { DEFAULT_AUTHORS, getPostsByAuthor } from '../utils/authors';

interface AuthorsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: BlogPostData[];
  onSelectPost: (postId: string) => void;
}

export const AuthorsDirectoryModal: React.FC<AuthorsDirectoryModalProps> = ({
  isOpen,
  onClose,
  posts,
  onSelectPost
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Authors Directory &bull; techstarz101.com</h2>
              <p className="text-xs text-neutral-400">Contributor profiles, bios, social channels, and published articles.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list of all authors */}
        <div className="p-6 overflow-y-auto space-y-6">
          {DEFAULT_AUTHORS.map((author) => {
            const authorPosts = getPostsByAuthor(posts, author.name);

            return (
              <div
                key={author.id}
                className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/40 shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">{author.name}</h3>
                      <p className="text-xs font-mono text-cyan-400">{author.role}</p>
                    </div>
                  </div>

                  {/* Social media links */}
                  <div className="flex items-center gap-2">
                    {author.socialLinks.twitter && (
                      <a
                        href={author.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-cyan-400 bg-neutral-900 border border-neutral-800 rounded transition-colors"
                      >
                        <Twitter className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {author.socialLinks.linkedin && (
                      <a
                        href={author.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-cyan-400 bg-neutral-900 border border-neutral-800 rounded transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {author.bio}
                </p>

                {/* Author's posts */}
                <div className="pt-2 border-t border-neutral-850">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Articles by {author.name} ({authorPosts.length}):</span>
                  </div>

                  {authorPosts.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">No articles published yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {authorPosts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectPost(p.id);
                            onClose();
                          }}
                          className="p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-medium text-neutral-200 group-hover:text-cyan-300 truncate">
                              {p.title}
                            </h5>
                            <span className="text-[10px] text-cyan-400 font-mono">
                              {p.categories?.join(', ') || 'General Tech'}
                            </span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
