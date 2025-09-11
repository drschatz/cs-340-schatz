import Image from "next/image";
import Link from "next/link";
import nextIMG from "public/squr.jpg";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center text-dark dark:text-light">
      <span className="font-bold dark:font-semibold text-lg md:text-xl hover:text-accent">
      &#47;&#42;CS128 LIVE &#42;&#47;
      </span>
    </Link>
  );
};

export default Logo;
