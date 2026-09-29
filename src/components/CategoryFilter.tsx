import React from 'react';
import { Category, BlogPostData } from '../types';

interface CategoryFilterProps {
  selectedCategory: Category | 'All';
  onSelectCategory: (cat: Category | 'All') => void;
  posts: BlogPostData[];
}

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'AI',
  'Development',
  'Startups',
  'General Tech'
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  posts
}) => {
  const getCount = (cat: Category | 'All') => {
    if (cat === 'All') return posts.length;
    return posts.filter(p => p.categories && p.categories.includes(cat)).length;
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
      <span className="text-xs text-neutral-400 font-medium mr-1 shrink-0">
        Filter by:
      </span>
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = getCount(cat);

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isSelected
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <span>{cat}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-cyan-500/25 text-cyan-200' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
