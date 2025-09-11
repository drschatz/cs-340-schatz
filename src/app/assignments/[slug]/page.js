import Markdown from "markdown-to-jsx";
import fs from "fs";
import matter from "gray-matter";

import getPostMetadata from "@/lib/getPostMetadata";
import parseMarkdownHeadings from "src/utils/parseTOC.js";

function getPostContent(slug) {
  const folder = "mps/";
  const file = folder + `${slug}.md`;
  const content = fs.readFileSync(file, "utf8");

  const matterResult = matter(content);
  return matterResult;
}

const generateStaticParams = async () => {
  const posts = getPostMetadata("mps");
  return posts.map((post) => ({ slug: post.slug }));
};

export async function generateMetadata({ params, searchParams }) {
  const id = params?.slug ? " ⋅ " + params?.slug : "";
  return {
    title: `MP deatils ${id.replaceAll("_", " ")}`,
  };
}

const MPPage = (props) => {
  const slug = props.params.slug;
  const post = getPostContent(slug);
  const headings = parseMarkdownHeadings(post.content);

  return (
    <main>
      <div className="mb-8 text-center relative w-full h-[24vh] bg-green-500 ">
        <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
            MPs - {post.data.title}
          </h1>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-green/60 dark:bg-dark/40" />
      </div>
      <div className="flex mb-8 sm:flex-row flex-col">
        <div className="w-full sm:w-4/12 sm:block mt-8 ml-24 text-base text-gray">
          <h3 className="mb-2 sticky top-24 font-bold">Syllabus Nav</h3>
          <ul className="ml-4 sticky top-32">
            {headings.map((heading, index) => (
              <li
                key={index}
                className={`hover:text-accent mb-1.5 ml-${
                  heading.level === 1 ? "0" : heading.level === 2 ? "4" : "8"
                }`}
              >
                <a href={`#${heading.slug}`} className="ml-2">
                  <strong>{heading.text}</strong>
                </a>
                {heading.subheadings && heading.subheadings.length > 0 && (
                  <ul
                    className={`ml-${
                      heading.level === 1
                        ? "4"
                        : heading.level === 2
                        ? "8"
                        : "12"
                    } text-sm`}
                  >
                    {heading.subheadings.map((subheading, subIndex) => (
                      <li
                        key={subIndex}
                        className={`hover:text-accent mb-1 ml-${
                          subheading.level === 2 ? "4" : "8"
                        }`}
                      >
                        <a href={`#${subheading.slug}`} className="ml-2">
                          <strong>{subheading.text}</strong>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full sm:w-7/12 mt-8 p-4">
          <div className="mb-8 ">
            <h1 className="text-3xl font-bold mb-4 text-accent">
              {post.data.title}
            </h1>
            <Markdown
              options={{
                overrides: {
                  h1: {
                    component: "h1",
                    props: {
                      className: "text-2xl font-semibold mt-8 mb-2",
                    },
                  },
                  h2: {
                    component: "h2",
                    props: {
                      className: "text-xl font-semibold mt-6 mb-2",
                    },
                  },
                  h3: {
                    component: "h3",
                    props: {
                      className: "text-lg font-semibold mt-4 mb-2",
                    },
                  },
                  h4: {
                    component: "h4",
                    props: {
                      className: "text-base font-semibold mt-4 mb-2",
                    },
                  },
                  p: {
                    component: "p",
                    props: {
                      className:
                        "mb-4 leading-9 text-black/80 font-medium text-lg ",
                    },
                  },
                  a: {
                    component: "a",
                    props: {
                      className: "text-accent hover:underline",
                    },
                  },
                  ul: {
                    component: "ul",
                    props: {
                      className: "list-disc ml-8 mb-4",
                    },
                  },
                  ol: {
                    component: "ol",
                    props: {
                      className:
                        "list-decimal tracking-normal ml-8 mb-2 text-lg",
                    },
                  },
                  li: {
                    component: "li",
                    props: {
                      className: "mb-2 ml-4 tracking-normal text-lg",
                    },
                  },
                  blockquote: {
                    component: "blockquote",
                    props: {
                      className:
                        "border-l-4 border-accent bg-gray-100 dark:bg-gray-800 p-2",
                    },
                  },
                  code: {
                    component: "code",
                    props: {
                      className:
                        "bg-neutral-700 dark:bg-gray-800 p-1 text-sm rounded text-white",
                    },
                  },
                  pre: {
                    component: "pre",
                    props: {
                      className:
                        "bg-gray-100 dark:bg-gray-800 p-2 text-sm rounded",
                    },
                  },
                  strong: {
                    component: "strong",
                    props: {
                      className: "font-semibold text-black",
                    },
                  },
                  em: {
                    component: "em",
                    props: {
                      className: "italic",
                    },
                  },
                  table: {
                    component: "table",
                    props: {
                      className: "table-auto w-full",
                    },
                  },
                  thead: {
                    component: "thead",
                    props: {
                      className: "bg-gray-100 dark:bg-gray-800",
                    },
                  },
                  th: {
                    component: "th",
                    props: {
                      className: "border dark:border-light p-2",
                    },
                  },
                  td: {
                    component: "td",
                    props: {
                      className: "border dark:border-light p-2",
                    },
                  },
                  tbody: {
                    component: "tbody",
                    props: {
                      className: "text-center",
                    },
                  },
                  tr: {
                    component: "tr",
                    props: {
                      className: "bg-gray-100 dark:bg-gray-800",
                    },
                  },
                  img: {
                    component: "img",
                    props: {
                      className: "w-full",
                    },
                  },
                },
              }}
            >
              {post.content}
            </Markdown>
          </div>
        </div>
        <div className="hidden sm:block w-1/12"></div>
      </div>
    </main>
  );
};

export default MPPage;
