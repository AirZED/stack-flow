import { Icons } from "../ui/icons";
import { TSentiment } from "../../lib/types";
import { useEffect } from "react";
import { useAppContext } from "../../context/AppContext";

const bullStrategies = {
  tag: "bull",
  items: [
    {
      name: "Call",
      description: "High profits if the price rises sharply",
    },
    {
      name: "Strap",
      description:
        "High profits if the price rises sharply, reasonable profits if the price falls",
    },
    {
      name: "Bull Call Spread",
      description:
        "Low cost, decent profits if the price rises to a certain level",
    },
    {
      name: "Bull Put Spread",
      description:
        "Low cost, decent profits if the price stays at a certain level or rises",
    },
  ],
};

const bearStrategies = {
  tag: "bear",
  items: [
    {
      name: "Put",
      description: "High profits if the price falls sharply",
    },
    {
      name: "Strip",
      description:
        "High profits if the price falls sharply, reasonable profits if the price rises",
    },
    {
      name: "Bear Put Spread",
      description:
        "Low cost, decent profits if the price falls to a certain level",
    },
    {
      name: "Bear Call Spread",
      description:
        "Low cost, decent profits if the price stays at a certain level or falls",
    },
  ],
};

const highVolStrategies = {
  tag: "high",
  items: [
    {
      name: "Straddle",
      description:
        "High profits if the price rises or falls sharply during the period of holding",
    },
    {
      name: "Strangle",
      description:
        "Low cost, very high profits if the price rises or falls significantly",
    },
  ],
};

const lowVolStrategies = {
  tag: "low",
  items: [
    {
      name: "Long Butterfly",
      description:
        "Low cost, high profits if the price is about a strike price",
    },
    {
      name: "Long Condor",
      description: "Decent profits if the price changes slightly",
    },
  ],
};

const sentiments = [
  bullStrategies,
  bearStrategies,
  highVolStrategies,
  lowVolStrategies,
];

const socialStrategies = [
  {
    name: "Copy Trading",
    description: "Automatically mirror whale and efficient trader wallets.",
  },
  {
    name: "Meme-Driven Investing",
    description: "Community pools driven by viral content and meme culture.",
  },
];

type Props = {
  selectedStrategy: string;
  selectedSentiment: TSentiment;
  asset: string;
};

export function StrategySelector({
  selectedStrategy,
  selectedSentiment,
  asset,
}: Props) {
  const { handleStrategyChange } = useAppContext();
  const currentStrategies =
    asset === "STX"
      ? sentiments.find(
        (sentiment) =>
          sentiment.tag.toLowerCase() === selectedSentiment.toLowerCase()
      )?.items || sentiments[0].items
      : socialStrategies;

  useEffect(() => {
    const defaultStrategy =
      asset === "STX"
        ? sentiments?.find(
          (sentiment) =>
            sentiment.tag?.toLowerCase() === selectedSentiment?.toLowerCase()
        )?.items?.[0]?.name ??
        sentiments?.[0]?.items?.[0]?.name ??
        ""
        : "Copy Trading";

    if (!defaultStrategy) return;

    handleStrategyChange(defaultStrategy);
  }, [selectedSentiment, asset]);

  const isSocial = asset === "BTC";

  return (
    <div className={`grid gap-4 ${isSocial ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
      {currentStrategies?.map((strategy, i) => {
        const isSelected = selectedStrategy?.toLowerCase() === strategy.name.toLowerCase();
        return (
          <div
            className={`rounded-lg p-px transition-colors ${isSelected
                ? "bg-linear-to-r from-[#37f741] to-[#FDEE61]"
                : isSocial
                  ? "bg-white/10"
                  : "bg-transparent"
              }`}
            key={i}
          >
            <div
              className={`rounded-lg h-full cursor-pointer p-4 space-y-2 min-h-[88px] flex flex-col justify-between bg-[#1D2215] border border-transparent ${isSocial && !isSelected ? "border-white/10" : ""
                }`}
              onClick={() => handleStrategyChange(strategy.name)}
            >
              <p className={`text-sm font-bold ${isSelected ? "text-transparent bg-linear-to-r from-[#37f741] to-[#FDEE61] bg-clip-text" : "text-[#ECECEC]"
                }`}>
                {strategy.name}
              </p>
              {!isSocial && <Icons.call className="shrink-0" />}
              <p className="text-xs text-[#A0A0A0] leading-snug">{strategy.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
