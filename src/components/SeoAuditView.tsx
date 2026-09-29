import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Wrench,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Tag,
  User,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { BlogPostData, SeoAuditCheck } from '../types';
import { runSeoAudit } from '../utils/seoAudit';
import { SeoScoreGauge } from './SeoScoreGauge';
import { KeywordDensityTable } from './KeywordDensityTable';

interface SeoAuditViewProps {
  post: BlogPostData;
  onEditClick: () => void;
  onUpdatePost: (updated: BlogPostData) => void;
  onOpenOptimizer?: () => void;
}

export const SeoAuditView: React.FC<SeoAuditViewProps> = ({
  post,
  onEditClick,
  onUpdatePost,
  onOpenOptimizer
}) => {
  const [filterMode, setFilterMode] = useState<'missing' | 'all' | 'passed'>('missing');
  const audit = runSeoAudit(post);

  // Quick fix handler for instant remediation
  const handleQuickFix = (check: SeoAuditCheck) => {
    if (!check.fixAction) {
      onEditClick();
      return;
    }

    switch (check.fixAction.type) {
      case 'optimize_image': {
        if (onOpenOptimizer) {
          onOpenOptimizer();
        } else {
          onEditClick();
        }
        break;
      }
      case 'add_brand_keyword': {
        const currentKws = post.keywords || '';
        const updatedKws = currentKws ? `techstarz101, tech blog, ${currentKws}` : 'techstarz101, tech blog';
        onUpdatePost({
          ...post,
          keywords: updatedKws
        });
        break;
      }
      case 'trim_description': {
        const trimmed = (post.description || '').slice(0, 152).trim() + '...';
        onUpdatePost({
          ...post,
          description: trimmed
        });
        break;
      }
      case 'add_alt_text': {
        const generatedAlt = `Editorial graphic illustrating ${post.title} for techstarz101.com`;
        onUpdatePost({
          ...post,
          imageAlt: generatedAlt
        });
        break;
      }
      case 'open_editor':
      default:
        onEditClick();
        break;
    }
  };

  const displayedChecks = {
    missing: audit.missingRequirements,
    all: audit.checks,
    passed: audit.passedChecks
  }[filterMode];

  return (
    <div className="space-y-6">
      {/* 1. Real-Time 'SEO Score' Circular Radial Gauge */}
      <SeoScoreGauge
        score={audit.score}
        rating={audit.rating}
        ratingColor={audit.ratingColor}
        missingCount={audit.missingRequirements.length}
        passedCount={audit.passedChecks.length}
        totalChecks={audit.checks.length}
        breakdown={audit.categoryBreakdown}
      />

      {/* 2. Simulated Google Search Result */}
      <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulated Google SERP Snippet Preview</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            techstarz101.com
          </span>
        </div>
        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-850 space-y-1">
          <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 truncate">
            <span className="text-cyan-400">https://techstarz101.com</span>
            <span className="text-neutral-500">&rsaquo;</span>
            <span className="text-neutral-300">blog</span>
            <span className="text-neutral-500">&rsaquo;</span>
            <span className="text-neutral-300">{post.slug}</span>
          </div>
          <h3 className="text-base text-cyan-300 hover:underline cursor-pointer font-medium leading-snug">
            {post.title} | techstarz101.com
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
            <span className="text-neutral-500">{post.datePublished} &mdash; </span>
            {post.description}
          </p>
        </div>
      </div>

      {/* 3. Real-Time Keyword Density Analyzer */}
      <KeywordDensityTable
        metrics={audit.keywordMetrics}
        wordCount={audit.metrics.wordCount}
        overallDensity={audit.metrics.overallKeywordDensity}
      />

      {/* 4. Requirements Checklist with Missing Items Filter */}
      <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              SEO &amp; Scrapeability Checklist
            </h3>
            <p className="text-xs text-neutral-400">
              Audit for Google Rich Snippets, WCAG accessibility, and downstream scraper compatibility.
            </p>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setFilterMode('missing')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                filterMode === 'missing'
                  ? 'bg-neutral-800 text-amber-300 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Missing ({audit.missingRequirements.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>All ({audit.checks.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('passed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                filterMode === 'passed'
                  ? 'bg-neutral-800 text-emerald-300 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Passed ({audit.passedChecks.length})</span>
            </button>
          </div>
        </div>

        {/* Empty state when zero missing requirements */}
        {filterMode === 'missing' && audit.missingRequirements.length === 0 && (
          <div className="p-8 rounded-lg bg-neutral-950 text-center border border-neutral-850 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">All Requirements Satisfied!</h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              This blog post meets all requirements for alt text, keyword density, meta descriptions, Schema.org BlogPosting, and author attribution.
            </p>
          </div>
        )}

        {/* Checklist Rows */}
        <div className="space-y-3">
          {displayedChecks.map((chk) => (
            <div
              key={chk.id}
              className={`p-4 rounded-lg border transition-all ${
                chk.status === 'pass'
                  ? 'bg-neutral-950/80 border-neutral-850'
                  : chk.status === 'warning'
                  ? 'bg-neutral-950 border-amber-800/40'
                  : 'bg-neutral-950 border-red-800/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {chk.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : chk.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{chk.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                          chk.status === 'pass'
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/30'
                            : chk.status === 'warning'
                            ? 'text-amber-400 bg-amber-950/60 border border-amber-800/30'
                            : 'text-red-400 bg-red-950/60 border border-red-800/30'
                        }`}
                      >
                        {chk.status}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">
                        [{chk.category}]
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      {chk.description}
                    </p>

                    {chk.recommendation && (
                      <div className="mt-2 text-xs text-amber-300/90 font-sans flex items-start gap-1.5 bg-amber-950/20 p-2 rounded border border-amber-800/20">
                        <span className="font-semibold text-amber-400">Action:</span>
                        <span>{chk.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Fix Button */}
                {chk.status !== 'pass' && (
                  <button
                    onClick={() => handleQuickFix(chk)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm mt-1 sm:mt-0"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{chk.fixAction ? chk.fixAction.label : 'Fix in Editor'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
