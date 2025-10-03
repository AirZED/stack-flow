import { ReactElement } from "react";
import Button from "../atoms/Button";
import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";

const Hero = (): ReactElement => {
  return (
    <section id="home">
      <div className="w-screen h-full bg-[#1a1a1a] overflow-hidden md:py-20">
        <div className="max-w-[1440px] mx-auto relative w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full text-white pt-14 ">
            <div className="container px-5 md:px-7 lg:px-12">
              <div className="relative flex flex-col items-center md:flex-row">
                {/* <!-- Left Column (Text) --> */}
                <div className="max-w-[503px] space-y-5  max-md:mt-20">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#37f741]/20 to-[#ffffff]/5 border border-[#bbf838]/30">
                    <div className="w-2 h-2 rounded-full bg-[#bbf838] animate-pulse"></div>
                    <span className="text-sm font-medium text-[#bbf838]">
                      Built on Stacks
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm font-medium text-gray-300">
                      Secured by Bitcoin
                    </span>
                  </div>

                  <div className="space-y-5 text-4xl font-black md:text-6xl ">
                    <h1 className="gradient-text">
                      StackFlow <br className="brr" />
                      Bitcoin-Secured <br className="brr" />
                      DeFi
                    </h1>
                    <h1>Sentiment Trading</h1>
                  </div>
                  <p className="text-lg md:text-2xl text-[#f6f6f6] ">
                    Ride the flow of capital and sentiment on Stacks. Track
                    whales, copy trades, and engage in meme-driven investing.
                  </p>

                  <div className="flex items-center gap-5">
            
                    <Button variant="gradient" className="text-black">
                      <Link
                        to={"/trade"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Launch StackFlow
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* <!-- Right Column (Image) --> */}
                <div className="w-full">
                  <div>
                    <video
                      src="/hero.mp4"
                      className="object-cover w-full h-auto"
                      autoPlay
                      muted
                      loop
                      playsInline
                    ></video>
                  </div>
                </div>
              </div>
            </div>
            {/* Feature Ticker */}

            <div className="max-w-[1110px] mx-auto py-10 relative slider-mask ">
              <Marquee autoFill speed={40}>
                <div className="flex items-center gap-8 pl-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-800">
                    <span className="text-2xl">🐋</span>
                    <span className="text-sm font-semibold text-white">
                      Whale Tracking
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-800">
                    <span className="text-2xl">📊</span>
                    <span className="text-sm font-semibold text-white">
                      Copy Trading
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-800">
                    <span className="text-2xl">₿</span>
                    <span className="text-sm font-semibold text-white">
                      Bitcoin Secured
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-800">
                    <span className="text-2xl">🔒</span>
                    <span className="text-sm font-semibold text-white">
                      Self-Custody
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-800">
                    <span className="text-2xl">🎯</span>
                    <span className="text-sm font-semibold text-white">
                      Sentiment Strategies
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-800">
                    <span className="text-2xl">🚀</span>
                    <span className="text-sm font-semibold text-white">
                      Meme Pools
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-800">
                    <span className="text-2xl">⚡</span>
                    <span className="text-sm font-semibold text-white">
                      Real-Time Signals
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-800">
                    <span className="text-2xl">🌐</span>
                    <span className="text-sm font-semibold text-white">
                      Decentralized
                    </span>
                  </div>
                </div>
              </Marquee>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
