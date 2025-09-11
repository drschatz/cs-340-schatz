import Link from "next/link";
import React from "react";

const QuizzesPage = () => {
  return (
    <main>
      <div className="mb-8 text-center relative w-full h-[24vh] bg-rose-300">
        <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
            Exams
          </h1>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-amber/60 dark:bg-amber/40" />
      </div>

      <div className="container flex sm:flex-row flex-col">
        <div className="w-full sm:w-9/12">
          <div className="w-full max-w-[900px] gap-2 mb-8">
            <h2 className="font-bold text-2xl mb-5">Exams</h2>
            <Link href="/">
              <div className="w-full h-[140px] border border-gray/50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg mb-6">
                <div className="p-4 mx-5">
                  <h4 className="text-xl text-accent font-bold mb-3">
                    Exam 1: Topic of Exam 1
                  </h4>
                  <div className="flex flex-row justify-between mb-2 mr-10">
                    <p className="inline-block">
                      Registration: <span className="text-gray">Aug 29th</span>
                    </p>
                    <p className="inline-block">
                      Exam Period:{" "}
                      <span className="text-gray">Sep 10th - Sep 15th</span>
                    </p>
                  </div>

                  <p className="mb-2">
                    Topics Covered: Classes, Objects, Variables
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/">
              <div className="w-full h-[140px] border border-gray/50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg">
                <div className="p-4 mx-5">
                  <h4 className="text-xl text-accent font-bold mb-3">
                    Exam 2: Topic of Exam 2
                  </h4>
                  <div className="flex flex-row justify-between mb-2 mr-10">
                    <p className="inline-block">
                      Registration: <span className="text-gray">Aug 29th</span>
                    </p>
                    <p className="inline-block">
                      Exam Period:{" "}
                      <span className="text-gray">Sep 10th - Sep 15th</span>
                    </p>
                  </div>

                  <p className="mb-2">
                    Topics Covered: Classes, Objects, Variables
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="w-full sm:w-3/12 flex mb-8 flex-col mr-4">
          <h2 className="font-bold mb-5 text-2xl">About</h2>
          <p className="mb-3">
            Exams are a great way to test your knowledge and understanding of
            the concepts taught in the course. They are designed to be
            challenging and engaging.
          </p>
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-xl">DRES</h3>
            <p>
              The Department of Research and Education Services (DRES) is
              responsible for the development and delivery of all courses and
              exams.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuizzesPage;
