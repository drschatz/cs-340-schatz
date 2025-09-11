"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ResourcePage = () => {
  const [showMP1, setShowMP1] = useState(false);
  const [showMP2, setShowMP2] = useState(false);
  const [showMP3, setShowMP3] = useState(false);

  useEffect(() => {
    const currentDateTime = new Date();
    const targetDateTimeMP1 = new Date("2024-09-06T09:00:00-06:00");
    const targetDateTimeMP2 = new Date("2024-10-04T09:00:00-06:00"); 
    const targetDateTimeMP3 = new Date("2024-11-01T09:00:00-06:00"); // fake date

    if (true) {
      setShowMP1(true);
    }
    if (currentDateTime >= targetDateTimeMP2) {
      setShowMP2(true);
    }
    if (currentDateTime >= targetDateTimeMP3) {
      setShowMP3(true);
    }
  }, []);

  return (
    <div className="mb-20">
      <div className="mb-8 text-center relative w-full h-[24vh] bg-purple-500">
        <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
            MPs
          </h1>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-amber/60 dark:bg-amber/40" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col justify-center items-center">
          {showMP1 && (
            <Link href="/course-book/mps/WordGuess">
              <div className="mb-4 border-4 border-blue-500 rounded-lg shadow-sm w-80 h-30 flex-shrink-0 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col justify-center p-6">
                  <h3 className="text-xl font-semibold text-center">
                    MP 1 - WordGuess
                  </h3>
                  <hr className="border-gray/70 my-2" />
                </div>
              </div>
            </Link>
          )}

          {showMP2 && (
            <Link href="/course-book/mps/SeamCarver">
              <div className="mb-4 border-4 border-blue-500 rounded-lg shadow-sm w-80 h-30 flex-shrink-0 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col justify-center p-6">
                  <h3 className="text-xl font-semibold text-center">
                    MP 2 - SeamCarver
                  </h3>
                  <hr className="border-gray/70 my-2" />
                </div>
              </div>
            </Link>
          )}

          {showMP3 && (
            <Link href="/course-book/mps/MusicalTrees">
              <div className="mb-4 border-4 border-blue-500 rounded-lg shadow-sm w-80 h-30 flex-shrink-0 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col justify-center p-6">
                  <h3 className="text-xl font-semibold text-center">
                    MP 3 - MusicalTrees
                  </h3>
                  <hr className="border-gray/70 my-2" />
                </div>
              </div>
            </Link>
          )}
        </div>

        {!showMP1 && !showMP2 && !showMP3 && (
          <>
            <h3 className="text-xl font-semibold text-center">
              No MPs available yet...
            </h3>
            <br />
            <h3 className="text-xl font-semibold text-center">
              Come back later!
            </h3>
          </>
        )}
      </div>

      <div className="hidden sm:block w-1/12"></div>
    </div>
  );
};

export default ResourcePage;
