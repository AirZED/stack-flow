import Option from "../atoms/Option";

const options = [
  // Bullish Strategies
  {
    image: "./src/assets/Graph/1.png",
    title: "Call",
    description: "High profits if price rises sharply",
    category: "Bullish"
  },
  {
    image: "./src/assets/Graph/2.png",
    title: "Bull Call Spread",
    description: "Low cost, decent profits if price rises to a certain level",
    category: "Bullish"
  },
  {
    image: "./src/assets/Graph/3.png",
    title: "Bull Put Spread",
    description: "Low cost, profits if price stays or rises",
    category: "Bullish"
  },
  // Bearish Strategies
  {
    image: "./src/assets/Graph/4.png",
    title: "Put",
    description: "High profits if price falls sharply",
    category: "Bearish"
  },
  {
    image: "./src/assets/Graph/5.png",
    title: "Bear Put Spread",
    description: "Low cost, decent profits if price falls to a certain level",
    category: "Bearish"
  },
  {
    image: "./src/assets/Graph/6.png",
    title: "Bear Call Spread",
    description: "Low cost, profits if price stays or falls",
    category: "Bearish"
  },
  // High Volatility Strategies
  {
    image: "./src/assets/Graph/7.png",
    title: "Straddle",
    description: "High profits if price moves sharply in either direction",
    category: "High Volatility"
  },
  {
    image: "./src/assets/Graph/8.png",
    title: "Strangle",
    description: "Low cost, very high profits if price moves significantly",
    category: "High Volatility"
  },
  // Low Volatility Strategies
  {
    image: "./src/assets/Graph/9.png",
    title: "Long Butterfly",
    description: "Low cost, high profits if price stays near strike price",
    category: "Low Volatility"
  },
  {
    image: "./src/assets/Graph/10.png",
    title: "Long Condor",
    description: "Decent profits if price changes slightly",
    category: "Low Volatility"
  },
];

const Options = () => {
  return (
    <section id="options" className="py-16 bg-[#0d120c]">
      <div className="container px-4 mx-auto md:px-7 lg:px-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Capital Sentiment Strategies</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Choose from 10+ proven strategies tailored to your market outlook. 
            Built on Bitcoin-secured infrastructure for trustless execution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {options.map((option, index) => (
            <Option key={index} {...option} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Options;
