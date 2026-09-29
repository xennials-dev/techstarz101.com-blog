import React, { useState } from 'react';
import { X, Plus, Trash2, Check, RefreshCw, User, Tag, Twitter, Linkedin } from 'lucide-react';
import { BlogPostData, Category, AuthorProfile } from '../types';
import { createSlug } from '../utils/templateGenerator';
import { DEFAULT_AUTHORS, getAuthorByName } from '../utils/authors';

interface EditPostModalProps {
  post: BlogPostData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: BlogPostData) => void;
}

const AVAILABLE_CATEGORIES: Category[] = ['AI', 'Development', 'Startups', 'General Tech'];

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const currentAuthor = post.authorProfile || getAuthorByName(post.author);

  const [formData, setFormData] = useState<BlogPostData>({
    ...post,
    categories: post.categories && post.categories.length > 0 ? post.categories : ['General Tech']
  });

  const [authorData, setAuthorData] = useState<AuthorProfile>({
    ...currentAuthor
  });

  const handleTitleChange = (newTitle: string) => {
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: prev.slug === createSlug(prev.title) ? createSlug(newTitle) : prev.slug
    }));
  };

  const handleToggleCategory = (cat: Category) => {
    const current = formData.categories || [];
    if (current.includes(cat)) {
      if (current.length === 1) return; // Keep at least one category
      setFormData({
        ...formData,
        categories: current.filter(c => c !== cat)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...current, cat]
      });
    }
  };

  const handleSelectPredefinedAuthor = (authorId: string) => {
    const found = DEFAULT_AUTHORS.find(a => a.id === authorId);
    if (found) {
      setAuthorData(found);
      setFormData(prev => ({
        ...prev,
        author: found.name,
        authorId: found.id,
        authorProfile: found
      }));
    }
  };

  const handleSectionHeadingChange = (index: number, heading: string) => {
    const updated = [...formData.sections];
    updated[index].heading = heading;
    setFormData({ ...formData, sections: updated });
  };

  const handleSectionParagraphChange = (sectionIdx: number, pIdx: number, text: string) => {
    const updated = [...formData.sections];
    updated[sectionIdx].paragraphs[pIdx] = text;
    setFormData({ ...formData, sections: updated });
  };

  const handleAddParagraph = (sectionIdx: number) => {
    const updated = [...formData.sections];
    updated[sectionIdx].paragraphs.push('New paragraph detailing technical insights...');
    setFormData({ ...formData, sections: updated });
  };

  const handleRemoveParagraph = (sectionIdx: number, pIdx: number) => {
    const updated = [...formData.sections];
    updated[sectionIdx].paragraphs.splice(pIdx, 1);
    setFormData({ ...formData, sections: updated });
  };

  const handleAddSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          heading: 'New Technical Topic',
          paragraphs: ['Add key architectural takeaways and implementations.']
        }
      ]
    });
  };

  const handleRemoveSection = (index: number) => {
    const updated = [...formData.sections];
    updated.splice(index, 1);
    setFormData({ ...formData, sections: updated });
  };

  const handleRelatedPostChange = (idx: number, field: 'title' | 'slug', val: string) => {
    const updated = [...formData.relatedPosts];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormData({ ...formData, relatedPosts: updated });
  };

  const handleAddRelatedPost = () => {
    setFormData({
      ...formData,
      relatedPosts: [
        ...formData.relatedPosts,
        { title: 'New Related Tech Article', slug: 'new-related-tech-article' }
      ]
    });
  };

  const handleRemoveRelatedPost = (idx: number) => {
    const updated = [...formData.relatedPosts];
    updated.splice(idx, 1);
    setFormData({ ...formData, relatedPosts: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPost: BlogPostData = {
      ...formData,
      author: authorData.name,
      authorProfile: authorData
    };
    onSave(finalPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div>
            <h2 className="text-sm font-bold text-white">Edit Post &amp; Author Metadata &bull; techstarz101.com</h2>
            <p className="text-xs text-neutral-400">Updates live template, author profiles, JSON-LD Schema, and static folder structure.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-neutral-300">
          {/* Post Categories Assignment (Multi-Category) */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Categories (Assign one or more):</span>
              </label>
              <span className="text-[11px] font-mono text-cyan-400">
                {formData.categories.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_CATEGORIES.map((cat) => {
                const isSelected = formData.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100 text-cyan-400' : 'opacity-0'}`} />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1">
                Post Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-200">
                  Folder Slug (/blog/[post-slug])
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, slug: createSlug(formData.title) })}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync title</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: createSlug(e.target.value) })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Author Profile Section (Name, Bio, Twitter, LinkedIn) */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Author Profile &amp; Bio Information</span>
              </label>
              {/* Quick switch author profile */}
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <span>Preset:</span>
                <select
                  value={authorData.id}
                  onChange={(e) => handleSelectPredefinedAuthor(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-200 rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-cyan-500"
                >
                  {DEFAULT_AUTHORS.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.role.split(' ')[0]})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Author Name</label>
                <input
                  type="text"
                  value={authorData.name}
                  onChange={(e) => setAuthorData({ ...authorData, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Author Role / Title</label>
                <input
                  type="text"
                  value={authorData.role}
                  onChange={(e) => setAuthorData({ ...authorData, role: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Short Biography (displayed at end of post)</label>
              <textarea
                rows={2}
                value={authorData.bio}
                onChange={(e) => setAuthorData({ ...authorData, bio: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Social Media Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-neutral-400 mb-1 flex items-center gap-1">
                  <Twitter className="w-3 h-3 text-cyan-400" />
                  <span>Twitter / X Profile Link</span>
                </label>
                <input
                  type="url"
                  value={authorData.socialLinks.twitter || ''}
                  onChange={(e) => setAuthorData({
                    ...authorData,
                    socialLinks: { ...authorData.socialLinks, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/username"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 mb-1 flex items-center gap-1">
                  <Linkedin className="w-3 h-3 text-cyan-400" />
                  <span>LinkedIn Profile Link</span>
                </label>
                <input
                  type="url"
                  value={authorData.socialLinks.linkedin || ''}
                  onChange={(e) => setAuthorData({
                    ...authorData,
                    socialLinks: { ...authorData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Date, Image & Alt Text */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1">
                Date Published
              </label>
              <input
                type="date"
                value={formData.datePublished}
                onChange={(e) => setFormData({ ...formData, datePublished: e.target.value, dateModified: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-200">
                  Image Alt Text (SEO &amp; WCAG)
                </label>
              </div>
              <input
                type="text"
                value={formData.imageAlt || ''}
                placeholder="e.g. Architectural diagram of AI inference cluster"
                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-200">
                Meta Description (Target: 120–160 chars)
              </label>
              <span className={`font-mono text-[11px] ${formData.description.length > 165 ? 'text-amber-400' : 'text-neutral-400'}`}>
                {formData.description.length} chars
              </span>
            </div>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-semibold text-neutral-200 mb-1">
              Keywords (comma-separated, include "techstarz101, tech blog")
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Introduction */}
          <div>
            <label className="block text-xs font-semibold text-neutral-200 mb-1">
              Introduction Block
            </label>
            <textarea
              rows={3}
              value={formData.introduction}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sections List */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">Article Sections (H2 &amp; Paragraphs)</span>
              <button
                type="button"
                onClick={handleAddSection}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            {formData.sections.map((section, sIdx) => (
              <div key={sIdx} className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => handleSectionHeadingChange(sIdx, e.target.value)}
                    placeholder="Section Heading (H2)"
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-cyan-500"
                  />
                  {formData.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sIdx)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 rounded"
                      title="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 pl-2 border-l border-neutral-800">
                  {section.paragraphs.map((p, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={p}
                        onChange={(e) => handleSectionParagraphChange(sIdx, pIdx, e.target.value)}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded p-2 text-neutral-300 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                      {section.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParagraph(sIdx, pIdx)}
                          className="p-1 text-neutral-500 hover:text-red-400 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddParagraph(sIdx)}
                    className="text-[11px] text-cyan-400 hover:underline pt-1"
                  >
                    + Add paragraph
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Related Posts */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">Related Posts Links</span>
              <button
                type="button"
                onClick={handleAddRelatedPost}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Related Post</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.relatedPosts.map((rel, rIdx) => (
                <div key={rIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rel.title}
                    onChange={(e) => handleRelatedPostChange(rIdx, 'title', e.target.value)}
                    placeholder="Post Title"
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="text"
                    value={rel.slug}
                    onChange={(e) => handleRelatedPostChange(rIdx, 'slug', e.target.value)}
                    placeholder="post-slug"
                    className="w-44 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                  />
                  {formData.relatedPosts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRelatedPost(rIdx)}
                      className="p-1.5 text-neutral-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save &amp; Update Files</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
