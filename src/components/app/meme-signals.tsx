/**
 * Meme Signals Component
 * Displays viral meme sentiment and social trading signals
 */

import { useState, useEffect } from "react";
import { Icons } from "../ui/icons";
import { 
  socialSentimentService, 
  type MemeSignal
} from "../../services/socialSentimentService";

interface MemeSignalsProps {
  maxSignals?: number;
  onSignalSelect?: (signal: MemeSignal) => void;
}

export function MemeSignals({ maxSignals = 5, onSignalSelect }: MemeSignalsProps) {
  const [signals, setSignals] = useState<MemeSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');

  useEffect(() => {
    const fetchSignals = async () => {
      setLoading(true);
      try {
        const signalsData = filter === 'all' 
          ? await socialSentimentService.getMemeSignals()
          : await socialSentimentService.getMemeSignals(filter);
        
        setSignals(signalsData.slice(0, maxSignals));
      } catch (error) {
        console.error('Failed to fetch meme signals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();

    // Subscribe to updates
    const unsubscribe = socialSentimentService.subscribe((data) => {
      const filteredSignals = filter === 'all' 
        ? data.memeSignals
        : data.memeSignals.filter(s => s.sentiment === filter);
      
      setSignals(filteredSignals.slice(0, maxSignals));
    });

    return unsubscribe;
  }, [filter, maxSignals]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400 bg-green-500/20';
      case 'bearish': return 'text-red-400 bg-red-500/20';
      case 'neutral': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <Icons.trending className="w-4 h-4" />;
      case 'bearish': return <Icons.arrowDownRight className="w-4 h-4" />;
      case 'neutral': return <Icons.waves className="w-4 h-4" />;
      default: return <Icons.questionMark className="w-4 h-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'twitter': return <Icons.twitter className="w-4 h-4" />;
      case 'telegram': return <Icons.telegram className="w-4 h-4" />;
      default: return <Icons.fire className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="bg-[#1D2215] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icons.fire className="w-5 h-5 text-[#bbf838]" />
          <h3 className="text-lg font-bold text-white">Meme Signals</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1D2215] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icons.fire className="w-5 h-5 text-[#bbf838]" />
          <h3 className="text-lg font-bold text-white">Meme Signals</h3>
        </div>
        
        {/* Sentiment Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-[#121412] border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-hidden focus:border-[#bbf838]/50"
        >
          <option value="all">All Sentiments</option>
          <option value="bullish">Bullish</option>
          <option value="bearish">Bearish</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      <div className="space-y-4">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className="bg-[#121412] rounded-lg p-4 border border-white/5 hover:border-[#bbf838]/20 transition-colors cursor-pointer"
            onClick={() => onSignalSelect?.(signal)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium text-sm">{signal.title}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getSentimentColor(signal.sentiment)}`}>
                    {getSentimentIcon(signal.sentiment)}
                    {signal.sentiment.toUpperCase()}
                  </div>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2">{signal.description}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Viral Score */}
                <div className="flex items-center gap-1">
                  <Icons.fire className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-white font-bold">{signal.viralScore}</span>
                  <span className="text-xs text-gray-500">viral</span>
                </div>

                {/* Mentions */}
                <div className="flex items-center gap-1">
                  <Icons.heart className="w-4 h-4 text-pink-400" />
                  <span className="text-xs text-white font-bold">{formatNumber(signal.mentions)}</span>
                  <span className="text-xs text-gray-500">mentions</span>
                </div>

                {/* Source */}
                <div className="flex items-center gap-1">
                  {getSourceIcon(signal.source)}
                  <span className="text-xs text-gray-400 capitalize">{signal.source}</span>
                </div>
              </div>

              {/* Time and Confidence */}
              <div className="flex items-center gap-3 text-xs">
                <div className="text-gray-400">{formatTimeAgo(signal.createdAt)}</div>
                <div className={`px-2 py-1 rounded ${
                  signal.confidence >= 80 ? 'bg-green-500/20 text-green-400' :
                  signal.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {signal.confidence}% confidence
                </div>
              </div>
            </div>

            {/* Tags */}
            {signal.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                {signal.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#bbf838]/10 text-[#bbf838] text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {signal.tags.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{signal.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {signals.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Icons.fire className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No meme signals found for this sentiment</p>
        </div>
      )}
    </div>
  );
}
