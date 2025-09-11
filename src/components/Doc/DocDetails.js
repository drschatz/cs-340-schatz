import { format, parseISO } from "date-fns";
import Link from "next/link";
import React from "react";
import { slug } from "github-slugger";

const DocDetails = ({ doc, slug: docSlug }) => {
  return (
    <div className="px-2  md:px-10 bg-accent dark:bg-accentDark text-light dark:text-dark py-2 flex items-center justify-around flex-wrap text-lg sm:text-xl font-medium mx-5  md:mx-10 rounded-lg">
      <time className="m-3">
        {format(parseISO(doc.publishedAt), "LLLL d, yyyy")}
      </time>
      <div className="m-3">{doc.readingTime.text}</div>
      <Link href={`/categories/${slug(doc.tags[0])}`} className="m-3">
        #{doc.tags[0]}
      </Link>
    </div>
  );
};

export default DocDetails;
