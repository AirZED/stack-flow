import { ReactElement } from "react";
import { GoArrowUpRight } from "react-icons/go";
import whale_tracking_img from "../../assets/new graphics/1.png";
import bitcoin_security_img from "../../assets/new graphics/2.png";
import social_trading_img from "../../assets/new graphics/rocket.png";
import stackflow_hero_img from "../../assets/new graphics/3.png";

const serviceBoxes = [
  {
    icon: whale_tracking_img,
    title: "Whale Tracking",
    description: "Follow successful traders and copy their strategies in real-time.",
    iconSize: "h-16 w-16",
  },
  {
    icon: bitcoin_security_img,
    title: "Bitcoin Security",
    description: "Built on Stacks blockchain, secured by Bitcoin's proof-of-work.",
    iconSize: "h-16 w-16",
  },
  {
    icon: social_trading_img,
    title: "Social Sentiment",
    description: "Join meme-driven pools and community sentiment strategies.",
    iconSize: "h-16 w-16",
  },
];

const About = (): ReactElement => {
  return (
    <div
      id="about"
      className="bg-linear-to-b from-[#101210] via-[#0c0d0c] to-[#080908] pt-5 pb-16"
    >
      <div className="container px-4 mx-auto md:px-7 lg:px-12">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-1/2">
            <div className="p-8 text-white">
              <h4 className="text-xl mb-2 text-[#bbf838]">About us</h4>
              <h1 className="text-4xl font-bold">
                Bitcoin-Secured Sentiment Trading
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap service-bg">
          <div className="w-full lg:w-1/2">
            <div className="serivce-thumb">
              <img
                src={stackflow_hero_img}
                className="w-[clamp(24rem,50vw,35rem)] filter drop-shadow-[30px_20px_10px_#000000] pr-16"
                alt="StackFlow - Bitcoin-Secured Sentiment Trading"
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="flex flex-col space-y-6">
              {serviceBoxes.map((service, index) => (
                <a
                  key={index}
                  href="#"
                  className="block "
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between flex-1 p-6 transition-all bg-white rounded-lg single-service-box2 bg-opacity-10 hover:bg-opacity-20">
                    <div>
                      <div className="service-icon pr-2.5">
                        <img
                          src={service.icon}
                          className={service.iconSize}
                          alt={service.title}
                        />
                      </div>
                      <div className="flex-1 service-content">
                        <h2 className="mb-2 text-xl font-semibold text-white service-title">
                          {service.title}
                        </h2>
                        <p className="mb-4 text-gray-300 service-desc">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <GoArrowUpRight className="text-[#3E3F3D] text-[2.2rem]" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
