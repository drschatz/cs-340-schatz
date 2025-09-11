import React from "react";

// import { allDocs } from "@/.contentlayer/generated";
import { bookToc } from "@/src/constant/bookToc";

const CourseBookPage = () => {
  console.log("Hello");

  return (
    <main>
      <div className="mb-8 text-center relative w-full h-[24vh] bg-slate-400 ">
        <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
            Course Book
          </h1>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-blue/60 dark:bg-dark/40" />
      </div>
      <div className="flex mb-8">
        <div className="w-4/12 hidden sm:block  mt-8 ml-24 text-base text-gray ">
          <h3 className="mb-2 sticky top-24 font-semibold">Book Nav</h3>
          <ul className="ml-4 sticky top-32">
            {bookToc.map((chap) => (
              <li key={chap.chapterIdx} className="hover:text-accent">
                <a href={`#${chap.chapterIdx}`} className="ml-2 ">
                  <strong>{`${chap.chapterIdx}. ${chap.chapterTitle}`}</strong>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-7/12 mt-8 p-4 ">
          <div className="mb-8 ">
            <h1 className="text-3xl font-bold mb-4 text-accent">Course Book</h1>
            <p className="leading-9 mb-4 text-lg text-black/80 font-medium">
              This is the introduction of the book. Tailwind CSS uses a lot of
              custom CSS at-rules like @tailwind, @apply, and @config, and in
              many editors this can trigger warnings or errors where these rules
              aren’t recognized. The solution to this is almost always to
              install a plugin for your editor/IDE for PostCSS language support
              instead of regular CSS. If you are using VS Code, our official
              Tailwind CSS IntelliSense plugin includes a dedicated Tailwind CSS
              language mode that has support for all of the custom at-rules and
              functions Tailwind uses. In some cases, you may need to disable
              native CSS linting/validations if your editor is very strict about
              the syntax it expects in your CSS files.
              <br />
              <br />
              This is the introduction of the book. Tailwind CSS uses a lot of
              custom CSS at-rules like @tailwind, @apply, and @config, and in
              many editors this can trigger warnings or errors where these rules
              aren’t recognized. The solution to this is almost always to
              install a plugin for your editor/IDE for PostCSS language support
              instead of regular CSS. If you are using VS Code, our official
              Tailwind CSS IntelliSense plugin includes a dedicated Tailwind CSS
              language mode that has support for all of the custom at-rules and
              functions Tailwind uses. In some cases, you may need to disable
              native CSS linting/validations if your editor is very strict about
              the syntax it expects in your CSS files.
              <br />
              <br />
              This is the introduction of the book. Tailwind CSS uses a lot of
              custom CSS at-rules like @tailwind, @apply, and @config, and in
              many editors this can trigger warnings or errors where these rules
              aren’t recognized. The solution to this is almost always to
              install a plugin for your editor/IDE for PostCSS language support
              instead of regular CSS. If you are using VS Code, our official
              Tailwind CSS IntelliSense plugin includes a dedicated Tailwind CSS
              language mode that has support for all of the custom at-rules and
              functions Tailwind uses. In some cases, you may need to disable
              native CSS linting/validations if your editor is very strict about
              the syntax it expects in your CSS files.
            </p>
          </div>

          {bookToc.map((chap) => (
            <div key={chap.chapterIdx} id={chap.chapterIdx}>
              <h1 className="font-bold text-2xl mb-4">{`${chap.chapterIdx}. ${chap.chapterTitle}`}</h1>
              <ul className="ml-4">
                {chap.sections.map((sec) => (
                  <li key={sec.key} className=" mb-2">
                    <a
                      href={sec.slug}
                      className="ml-2 text-lg text-black/80 hover:text-accent font-medium"
                    >
                      {sec.key}. {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="w-1/12"></div>
      </div>
    </main>
  );
};

export default CourseBookPage;
