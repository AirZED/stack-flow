type OptionProps = {
  image: string;
  title: string;
  description: string;
  category?: string;
};

const Option = ({ image, title, description, category }: OptionProps) => {
  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "Bullish":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Bearish":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "High Volatility":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low Volatility":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-8 hover:bg-[#222222] transition-all duration-300">
      <div className="project-thumb relative">
        <img src={image} alt={title} className="w-full" />
        {category && (
          <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(category)}`}>
            {category}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <h3 className="text-white text-2xl font-bold">{title}</h3>
        <p className="font-bold text-gray-500">Profitable if</p>
        <p className="text-white text-xl">{description}</p>
      </div>
    </div>
  );
};

export default Option;
