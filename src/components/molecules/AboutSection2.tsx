import Button from "../atoms/Button";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import community_img from "../../assets/new graphics/5.png";
import { Link } from "react-router-dom";

const AboutSection2 = () => {
  return (
    <section className="bg-[#0d120c]  text-white py-16">
      <div className="container px-4 mx-auto md:px-7 lg:px-12">
        <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Image */}
          <div className="flex justify-start">
            <div className="relative ">
              <img
                src={community_img}
                alt="Community-Driven Trading"
                className="w-[clamp(20rem,50vw,500px)] filter drop-shadow-[30px_20px_10px_#000000]"
              />
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8">
            <div>
              <h1 className="mb-6 text-4xl font-bold">
                {" "}
                Community-Driven Trading
              </h1>
              <p className="text-gray-300">
                StackFlow empowers the community with transparent,
                Bitcoin-secured trading. Follow successful whales, join viral
                meme pools, and access professional sentiment strategies—all
                while maintaining complete self-custody of your assets.
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-3 border-b border-b-white/10 pb-10 text-[#7b7b7b]">
              {[
                "Non-Custodial Trading",
                "Real-Time Whale Signals",
                "Meme-Driven Pools",
                "12+ Sentiment Strategies",
              ].map((item) => (
                <li key={item} className="flex items-center space-x-2">
                  <IoCheckmarkDoneOutline className="text-[#bbf737] " />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link
              className="flex items-center justify-start w-full gap-2 text-black"
              to="/about"
            >
              <Button variant="gradient">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection2;
