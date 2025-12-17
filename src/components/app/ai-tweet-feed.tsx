/**
 * Yaps on X Feed Component
 * Displays tweets with clickable token mentions and pagination
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RefreshCw, Heart, Repeat2, MessageCircle, ChevronDown } from 'lucide-react';
import {
  getTweetsForPage,
  clearTweetCache,
  type AITweet,
  type TokenMention,
} from '../../services/openRouterService';

interface AITweetFeedProps {
  onTokenClick: (token: TokenMention) => void;
  selectedTimeframe: '1h' | '4h' | '1d' | '1w';
  selectedAsset: 'all' | 'STX' | 'BTC';
}

export function AITweetFeed({ onTokenClick, selectedTimeframe, selectedAsset }: AITweetFeedProps) {
  const [tweets, setTweets] = useState<AITweet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState<number | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadInitialTweets = async () => {
    setIsLoading(true);
    try {
      const { tweets: newTweets } = await getTweetsForPage(1);
      setTweets(newTweets);
      setCurrentPage(1);
      setNextRefreshTime(Date.now() + 45 * 60 * 1000);
    } catch (error) {
      console.error('Failed to load tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreTweets = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const { tweets: newTweets } = await getTweetsForPage(nextPage);
      setTweets((prev) => [...prev, ...newTweets]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load more tweets:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    clearTweetCache();
    await loadInitialTweets();
  };

  // Auto-refresh timer
  useEffect(() => {
    loadInitialTweets();

    // Set up 45-minute refresh interval
    refreshTimerRef.current = setInterval(() => {
      loadInitialTweets();
    }, 45 * 60 * 1000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Filter tweets based on timeframe and asset
  const filteredTweets = useMemo(() => {
    return tweets.filter((tweet) => {
      // Timeframe filter - show tweets from selected timeframe or broader
      const timeframeOrder = { '1h': 1, '4h': 2, '1d': 3, '1w': 4 };
      const tweetTimeframeValue = timeframeOrder[tweet.timeframe] || 2;
      const selectedTimeframeValue = timeframeOrder[selectedTimeframe] || 2;
      const matchesTimeframe = selectedTimeframe === '1w' || tweetTimeframeValue <= selectedTimeframeValue;

      // Asset filter
      const matchesAsset =
        selectedAsset === 'all' || tweet.asset === selectedAsset || tweet.asset === 'general';

      return matchesTimeframe && matchesAsset;
    });
  }, [tweets, selectedTimeframe, selectedAsset]);

  // Countdown timer display
  const [timeUntilRefresh, setTimeUntilRefresh] = useState('');
  useEffect(() => {
    const updateCountdown = () => {
      if (nextRefreshTime) {
        const remaining = Math.max(0, nextRefreshTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeUntilRefresh(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRefreshTime]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderTweetText = useCallback(
    (tweet: AITweet) => {
      const text = tweet.text;
      const elements: (string | JSX.Element)[] = [];
      let lastIndex = 0;

      const mentions: { start: number; end: number; token: TokenMention }[] = [];

      tweet.tokens.forEach((token) => {
        const searchValue = token.value;
        let index = text.indexOf(searchValue, lastIndex);
        // Also try case-insensitive for tickers
        if (index === -1 && token.type === 'ticker') {
          index = text.toLowerCase().indexOf(searchValue.toLowerCase());
        }
        if (index !== -1 && !mentions.some((m) => m.start === index)) {
          mentions.push({ start: index, end: index + searchValue.length, token });
        }
      });

      mentions.sort((a, b) => a.start - b.start);

      mentions.forEach((mention, idx) => {
        if (mention.start > lastIndex) {
          elements.push(text.slice(lastIndex, mention.start));
        }

        elements.push(
          <button
            key={`token-${tweet.id}-${idx}`}
            onClick={(e) => {
              e.stopPropagation();
              onTokenClick(mention.token);
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#37f741]/20 text-[#37f741] hover:bg-[#37f741]/30 transition-colors font-medium"
          >
            {mention.token.type === 'ticker' ? (
              mention.token.value
            ) : (
              <>
                <span className="text-xs opacity-70">CA:</span>
                {mention.token.value.slice(0, 8)}...
              </>
            )}
          </button>
        );

        lastIndex = mention.end;
      });

      if (lastIndex < text.length) {
        elements.push(text.slice(lastIndex));
      }

      return elements.length > 0 ? elements : text;
    },
    [onTokenClick]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37f741] mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading yaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">Yaps on X</h3>
          <p className="text-sm text-slate-400">
            Click on tokens to trade • Refreshes in {timeUntilRefresh}
            {filteredTweets.length !== tweets.length && (
              <span className="ml-2 text-[#37f741]">
                ({filteredTweets.length} of {tweets.length} shown)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-slate-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tweet List */}
      {filteredTweets.length === 0 ? (
        <div className="text-center py-12 bg-[#121412] rounded-xl border border-white/5">
          <p className="text-slate-400">No yaps found for the selected filters</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting timeframe or asset filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTweets.map((tweet) => (
            <div
              key={tweet.id}
              className="bg-[#121412] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
            >
              {/* Author */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={tweet.author.avatar}
                  alt={tweet.author.displayName}
                  className="w-10 h-10 rounded-full bg-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white truncate">{tweet.author.displayName}</span>
                    <span className="text-slate-500 text-sm">@{tweet.author.username}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-sm">{formatTime(tweet.createdAt)}</span>
                  </div>

                  {/* Tweet Text */}
                  <p className="text-white mt-1 whitespace-pre-wrap break-words">{renderTweetText(tweet)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    {formatNumber(tweet.metrics.replies)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Repeat2 className="w-4 h-4" />
                    {formatNumber(tweet.metrics.retweets)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Heart className="w-4 h-4" />
                    {formatNumber(tweet.metrics.likes)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 px-2 py-0.5 rounded bg-white/5">
                    {tweet.timeframe}
                  </span>
                  <span className="text-xs text-slate-500 px-2 py-0.5 rounded bg-white/5">
                    {tweet.asset}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      tweet.sentiment === 'bullish'
                        ? 'bg-[#37f741]/20 text-[#37f741]'
                        : tweet.sentiment === 'bearish'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {tweet.sentiment.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={loadMoreTweets}
          disabled={isLoadingMore}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300 disabled:opacity-50"
        >
          {isLoadingMore ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Load More Yaps
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AITweetFeed;
