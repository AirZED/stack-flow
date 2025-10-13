/**
 * Social Sentiment Demo
 * Demonstrates live social sentiment data with mock but realistic updates
 */

import { useState, useEffect } from "react";
import { Icons } from "../ui/icons";
import { socialSentimentService, type SocialSentimentData } from "../../services/socialSentimentService";

export function SocialSentimentDemo() {
  const [sentimentData, setSentimentData] = useState<SocialSentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await socialSentimentService.getSocialSentiment();
        setSentimentData(data);
      } catch (error) {
        console.error('Failed to load sentiment data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = socialSentimentService.subscribe((data) => {
      setSentimentData(data);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1D2215] rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded-sm w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded-sm w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded-sm w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className="bg-[#1D2215] rounded-lg p-6 text-center">
        <Icons.questionMark className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-400">Failed to load social sentiment data</p>
      </div>
    );
  }

  const getSentimentColor = (score: number) => {
    if (score >= 50) return 'text-green-400';
    if (score >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#1D2215] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icons.trending className="w-6 h-6 text-[#bbf838]" />
        <h3 className="text-lg font-bold text-white">Live Social Sentiment</h3>
        <div className="ml-auto text-xs text-gray-400">
          Updates every minute
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#121412] rounded-lg p-3 text-center">
          <div className={`text-xl font-bold ${getSentimentColor(sentimentData.overallSentiment.score)}`}>
            {sentimentData.overallSentiment.score > 0 ? '+' : ''}{sentimentData.overallSentiment.score}
          </div>
          <div className="text-xs text-gray-400">Market Sentiment</div>
        </div>
        
        <div className="bg-[#121412] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-[#bbf838]">
            {sentimentData.marketMetrics.whaleActivityLevel}%
          </div>
          <div className="text-xs text-gray-400">Whale Activity</div>
        </div>
        
        <div className="bg-[#121412] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-orange-400">
            {(sentimentData.marketMetrics.viralMentions / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-gray-400">Viral Mentions</div>
        </div>
        
        <div className="bg-[#121412] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-pink-400">
            {sentimentData.marketMetrics.communityEngagement}%
          </div>
          <div className="text-xs text-gray-400">Engagement</div>
        </div>
      </div>

      {/* Top Whale Activity */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <Icons.users className="w-4 h-4 text-[#bbf838]" />
          Top Whale Activity
        </h4>
        <div className="space-y-2">
          {sentimentData.whaleActivity.slice(0, 2).map((whale) => (
            <div key={whale.id} className="bg-[#121412] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-r from-[#37f741] to-[#FDEE61] flex items-center justify-center">
                  <span className="text-black font-bold text-xs">
                    {whale.alias.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{whale.alias}</div>
                  <div className="text-xs text-gray-400">{whale.winRate}% win rate</div>
                </div>
              </div>
              <div className={`text-sm font-bold ${whale.avgProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {whale.avgProfitLoss >= 0 ? '+' : ''}{whale.avgProfitLoss.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Meme Signals */}
      <div>
        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <Icons.fire className="w-4 h-4 text-orange-400" />
          Hot Meme Signals
        </h4>
        <div className="space-y-2">
          {sentimentData.memeSignals.slice(0, 2).map((signal) => (
            <div key={signal.id} className="bg-[#121412] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-white text-sm font-medium truncate flex-1 mr-2">
                  {signal.title}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-orange-400 font-bold">
                    {signal.viralScore} viral
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    signal.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                    signal.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {signal.sentiment.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 line-clamp-2">
                {signal.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
