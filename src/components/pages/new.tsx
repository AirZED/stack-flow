import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { AssetSelector } from "../app/assets-selector";
import { PriceSelector } from "../app/price-selector";
import { SentimentSelector } from "../app/sentiment-selector";
import { StrategySelector } from "../app/strategy-selector";
import { TradeSummary } from "../app/trade-summary";
import { TradingChart } from "../app/trading-chart";
import { WhaleTracker } from "../app/whale-tracker";
import { MemeSignals } from "../app/meme-signals";
import { AITweetFeed } from "../app/ai-tweet-feed";
import { Icons } from "../ui/icons";
import ReferralModal from "../molecules/ReferralModal";

export default function DappPage() {
  const { state, formatNumber } = useAppContext();
  const { asset, sentiment, strategy, assetPrice, isFetching } = state;
  const [sentimentTab, setSentimentTab] = useState<"yaps" | "signals">("yaps");

  const isSocialSentiment = asset === "BTC";

  return (
    <div className="p-0 m-0">
      <ReferralModal />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Capital Sentiment: left panel + chart */}
        {!isSocialSentiment && (
          <>
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="w-full md:max-w-[388px] space-y-4">
                <AssetSelector selectedAsset={asset} />
                <SentimentSelector selectedSentiment={sentiment} />
                <StrategySelector
                  selectedStrategy={strategy}
                  selectedSentiment={sentiment}
                  asset={asset}
                />
              </div>
              <div className="flex-1 min-w-0 bg-[#1D2215] p-6 rounded-xl border border-white/5">
                <TradingChart asset="STX" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <PriceSelector />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <TradeSummary />
            </div>
          </>
        )}

        {/* Social Sentiment: single full-width aligned layout */}
        {isSocialSentiment && (
          <div className="space-y-6">
            {/* Top bar: Asset Type + Sub-selection cards in one row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr] lg:gap-6">
              <AssetSelector selectedAsset={asset} />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#37f741]/60 mb-2">Choose feature</p>
                <StrategySelector
                  selectedStrategy={strategy}
                  selectedSentiment={sentiment}
                  asset={asset}
                />
              </div>
            </div>

            {/* STX price strip – same width as content */}
            <div className="flex items-center justify-between bg-[#1D2215] rounded-lg px-4 py-3 border border-white/5">
              <span className="text-sm text-[#7A7A7A]">STX price</span>
              <span className="text-sm font-semibold text-white">
                {isFetching ? "..." : formatNumber(assetPrice)}
              </span>
            </div>

            {/* Content: one panel, full width */}
            {strategy?.toLowerCase() === "copy trading" && (
              <div className="bg-[#1D2215] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Icons.users className="w-5 h-5 text-[#37f741]" />
                  Copy Trading – Whale Tracker
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Track whale wallets and mirror successful trades on Stacks
                </p>
                <WhaleTracker maxWhales={5} />
              </div>
            )}
            {strategy?.toLowerCase() === "meme-driven investing" && (
              <div className="bg-[#1D2215] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Icons.trending className="w-5 h-5 text-[#37f741]" />
                  Sentiment & Trending
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Yaps on X and trending signals for STX
                </p>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSentimentTab("yaps")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sentimentTab === "yaps"
                      ? "bg-[#37f741] text-black"
                      : "bg-white/10 text-gray-400 hover:text-white"
                      }`}
                  >
                    Yaps on X
                  </button>
                  <button
                    onClick={() => setSentimentTab("signals")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sentimentTab === "signals"
                      ? "bg-[#37f741] text-black"
                      : "bg-white/10 text-gray-400 hover:text-white"
                      }`}
                  >
                    Trending Signals
                  </button>
                </div>
                {sentimentTab === "yaps" ? (
                  <AITweetFeed selectedTimeframe="4h" selectedAsset="all" />
                ) : (
                  <MemeSignals maxSignals={5} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
