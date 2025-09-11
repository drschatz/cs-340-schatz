import Image from "next/image";
import Tooltip from "./Tooltip";

const StaffCard = ({ imgSrc, name, pronouns,title, email, website, emojis = [] }) => {
  return (
    <div className="flex flex-col justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 w-72 h-96">
      <div className="relative w-full h-80 overflow-hidden rounded-md">
        <Image
          src={imgSrc}
          alt={`${name} Profile Image`}
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <h4 className="text-gray-700 text-md">{pronouns}</h4>
        <h4 className="text-gray-700 text-md">{title}</h4>
        <hr className="border-gray-700 my-2" />
      </div>
      <div className="flex items-center justify-around space-x-2">
        {emojis.map((emoji, index) => (
          <Tooltip key={index} text={emoji.text}>
            <span
              role="img"
              aria-label={`hobby${index + 1}`}
              className="text-2xl cursor-pointer"
            >
              {emoji.symbol}
            </span>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};


export default StaffCard;
