import { memo, useEffect, useRef } from "react";

function TradingViewWidget({ asset }: { asset: string }) {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous content
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    // Handle different symbols for different assets
    let symbol = "";
    if (asset === "STX") {
      symbol = "COINBASE:STX-USD"; // STX is available on Coinbase
    } else if (asset === "BTC") {
      symbol = "BINANCE:BTCUSDT";
    } else if (asset === "ETH") {
      symbol = "BINANCE:ETHUSDT";
    } else {
      symbol = `BINANCE:${asset.toUpperCase()}USDT`;
    }
    
    script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "1",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "hide_top_toolbar": true,
          "hide_legend": true,
          "allow_symbol_change": false,
          "save_image": false,
          "calendar": false,
          "hide_volume": true,
          "support_host": "https://www.tradingview.com"
        }`;
    
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [asset]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "calc(100% - 32px)", width: "100%" }}
      ></div>
    </div>
  );
}

export default memo(TradingViewWidget);
