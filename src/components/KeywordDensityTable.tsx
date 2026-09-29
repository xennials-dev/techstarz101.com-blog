import React from 'react';
import { KeywordMetric } from '../types';
import { Hash, Info } from 'lucide-react';

interface KeywordDensityTableProps {
  metrics: KeywordMetric[];
  wordCount: number;
  overallDensity: number;
}

export const KeywordDensityTable: React.FC<KeywordDensityTableProps> = ({
  metrics,
  wordCount,
  overallDensity
}) => {
  return (
    <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Keyword Density Analyzer</h3>
        </div>
        <div className="text-xs font-mono text-neutral-400">
          Total: <span className="text-cyan-300 font-semibold">{overallDensity}%</span> across {wordCount} words
        </div>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Search engines look for natural keyword placement. The industry recommended density is between <span className="text-white font-medium">1.0% and 2.5%</span>. Frequencies under 0.5% provide weak relevance, while frequencies above 3.5% risk keyword stuffing penalties.
      </p>

      {metrics.length === 0 ? (
        <div className="p-3 text-center text-xs text-neutral-500 italic bg-neutral-950 rounded">
          No keywords specified. Add comma-separated keywords in post metadata.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                <th className="pb-2 font-medium">Keyword / Phrase</th>
                <th className="pb-2 font-medium text-center">Occurrences</th>
                <th className="pb-2 font-medium text-center">Density</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {metrics.map((km, i) => (
                <tr key={i} className="hover:bg-neutral-850/30 transition-colors">
                  <td className="py-2 font-sans font-medium text-neutral-200">
                    #{km.keyword}
                  </td>
                  <td className="py-2 text-center text-white tabular-nums">
                    {km.count}
                  </td>
                  <td className="py-2 text-center tabular-nums">
                    <span
                      className={`font-semibold ${
                        km.status === 'optimal'
                          ? 'text-emerald-400'
                          : km.status === 'low'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {km.density}%
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        km.status === 'optimal'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : km.status === 'low'
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                          : 'bg-red-950/40 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {km.status === 'optimal' ? 'Optimal' : km.status === 'low' ? 'Low (<0.5%)' : 'Overuse (>3.5%)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
