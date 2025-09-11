import StaffCard from "./StaffCard";

import Emilia from "public/profile_img/Emilia_Daniels.jpg";
import Lumi from "public/profile_img/Lumi_Xu.png";
import Sarah from "public/profile_img/Sarah_Dowden.jpeg";
import Vani from "public/profile_img/Vani_Ramesh.jpg";
import Jule from "public/profile_img/Jule_Schatz.JPG";
import Elen from "public/profile_img/Elen.jpg";
import Eero from "public/profile_img/Eero.jpg";
import Gwen from "public/profile_img/Gwen.png";
import Anush from "public/profile_img/Anushree_Mishra.png";

const PeoplePage = () => {
  const staffList = [
    {
      imgSrc: Jule,
      name: "Jule Schatz (you-la shots)",
      pronouns: "She/Her",
      title: "Professor",
      email: "drschatz@illinois.edu",
      website: "juleschatz.com",
      emojis: [
        { text: "I love to paint!", symbol: "🎨" },
        { text: "I have a lego problem...", symbol: "👷‍♀️" },
        {
          text: "I started college wanting to major in atmospheric science. Now I have 3 computer science degrees!",
          symbol: "⛅",
        },
        { text: "I make the best chocolate chip cookies.", symbol: "🍪" },
      ],
    },
    {
      imgSrc: Elen,
      name: "Elen Chatikyan",
      pronouns: "She/Her",
      title: "Teaching Assistant (TA)",
      emojis: [
        { text: "My favorite hobby", symbol: "😴" },
        { text: "Crafting one line at a time", symbol: "👩‍💻" },
        {
          text: "Whipping up something delicious in the kitchen is my happy place",
          symbol: "👩‍🍳",
        },
        { text: "Armenian food is my soul's comfort", symbol: "🇦🇲" },
      ],
    },
    {
      imgSrc: Emilia,
      name: "Emilia Daniels",
      pronouns: "She/Her",
      title: "Course Assistant (CA)",
      emojis: [
        { text: "Matcha enthusiast :D", symbol: "🍵" },
        { text: "I enjoy both listening to and playing music", symbol: "🎶" },
        { text: "I love all things arts and crafts", symbol: "🎨" },
        {
          text: "I'm half Filipino and heavily involved in the Philippine Student Association on campus!",
          symbol: "🇵🇭",
        },
      ],
    },
    {
      imgSrc: Lumi,
      name: "Lumi Xu",
      pronouns: "She/Her",
      title: "Course Assistant (CA)",
      emojis: [
        {
          text: "I’ve just started training for my first half marathon!",
          symbol: "🏃‍♀️",
        },
        { text: "Have you seen them in campus town?", symbol: "🦝" },
        {
          text: "Hope you enjoy the course and get something special from it :)",
          symbol: "㊗",
        },
      ],
    },
    {
      imgSrc: Sarah,
      name: "Sarah Dowden",
      pronouns: "She/Her",
      title: "Course Assistant (CA)",
      emojis: [
        { text: "I am on the UIUC women's rugby team", symbol: "🏉" },
        {
          text: "I love hiking and exploring around the Pacific Northwest",
          symbol: "⛰",
        },
        { text: "My favorite dinosaur is the ankylosaurus", symbol: "🦕" },
      ],
    },
    {
      imgSrc: Vani,
      name: "Vani Ramesh",
      pronouns: "She/Her",
      title: "Course Assistant (CA)",
      emojis: [
        { text: "I'm an extreme foodie :)", symbol: "🍲" },
        { text: "I love reading!", symbol: "📚" },
        { text: "I love baking in my freetime", symbol: "🧁" },
        { text: "I love learning about culture and history", symbol: "🪷" },
      ],
    },
    {
      imgSrc: Eero,
      name: "Eero Dunham",
      pronouns: "He/Him",
      title: "Course Assistant (CA)",
      emojis: [
        { text: "Rarely spotted without headphones", symbol: "🎧" },
        { text: "My preferred mode of transportation", symbol: "🚲" },
        { text: "I'm always sketching something", symbol: "🖊" },
        { text: "I almost majored in astronomy", symbol: "🪐" },
      ],
    },
    {
      imgSrc: Gwen,
      name: "Gwendolyn Slaughter",
      pronouns: "She/Her",
      title: "Course Assistant (CA)",
      emojis: [
        { text: "I love tea!", symbol: "🍵" },
        {
          text: "I love music I played the flute in high school",
          symbol: "🎼",
        },
        { text: "I love reading", symbol: "📚" },
        { text: "Anything chocolate is my favorite dessert", symbol: "🍫" },
      ],
    },
    {
      imgSrc: Anush,
      name: "Anush Mishra",
      pronouns: "He/Him",
      title: "Course Assistant (CA)",
      emojis: [
        {
          text: "I love cats and adopted one right before the semester began",
          symbol: "😼",
        },
        {
          text: "I'm a big fan of the chambana libraries",
          symbol: "📚",
        },
        {
          text: "I love music and I've been slowly building a collection of vinyl, CDs and cassettes",
          symbol: "🎼",
        },
      ],
    },
  ];
  return (
    <div>
      <div className="mb-8 text-center relative w-full h-[24vh] bg-pink-600">
        <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
            People
          </h1>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/40" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center mb-20">
        {staffList.map((staff, index) => (
          <StaffCard
            key={index}
            imgSrc={staff.imgSrc}
            name={staff.name}
            pronouns={staff.pronouns}
            title={staff.title}
            emojis={staff.emojis}
          />
        ))}
      </div>
    </div>
  );
};

export default PeoplePage;
