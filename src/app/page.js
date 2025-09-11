"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { Progress } from "@/components/ui/progress";
import video from "@/public/icons/video.svg";
import ppt from "@/public/icons/ppt.svg";

// Update the progress bar
const startDate = new Date("2024-08-26");
const endDate = new Date("2024-12-16");
const today = new Date();

const msInDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

const isPastDate = (date) => new Date(date) <= new Date();

const totalDays = Math.ceil((endDate - startDate) / msInDay);
const daysFromStart = Math.ceil((today - startDate) / msInDay);

let calculatedProgress = (daysFromStart / totalDays) * 100;
if (calculatedProgress > 100) {
  calculatedProgress = 100;
} else if (calculatedProgress < 0) {
  calculatedProgress = 0;
}

const variantStyles = {
  Quiz: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80 rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300 cursor-pointer",
  EC: "border-transparent bg-pink-400 text-slate-50 hover:bg-pink-200/80 focus:outline-none focus:ring-0 focus:ring-pink-400 dark:bg-pink-900 dark:text-slate-50 dark:hover:bg-pink-900/80 rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300 cursor-pointer",
  HW: "border-transparent bg-blue-500 text-slate-50 hover:bg-blue-500/80 focus:outline-none focus:ring-0 focus:ring-blue-500 dark:bg-blue-900 dark:text-slate-50 dark:hover:bg-blue-900/80 rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300 cursor-pointer",
  MP: "border-transparent bg-green-500 text-slate-50 hover:bg-green-500/80 focus:outline-none focus:ring-0 focus:ring-green-500 dark:bg-green-900 dark:text-slate-50 dark:hover:bg-green-900/80 rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300 cursor-pointer",
  Lab: "border-transparent bg-yellow-500 text-slate-50 hover:bg-yellow-500/80 focus:outline-none focus:ring-0 focus:ring-yellow-500 dark:bg-yellow-900 dark:text-slate-50 dark:hover:bg-yellow-900/80 rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300 cursor-pointer",
  Lecture:
    "border-transparent bg-slate-400 text-slate-50 hover:bg-slate-400/80 focus:outline-none focus:ring-0 focus:ring-slate-400 dark:bg-slate-400 dark:text-slate-50 dark:hover:bg-slate-400/80 rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-400 cursor-pointer",
};

function formatDate(dateString) {
  // Parse the date components manually to avoid automatic timezone adjustments
  const [year, month, day] = dateString.split("-").map(Number);

  // Create a Date object in UTC time, equivalent to midnight CST
  const utcDate = new Date(Date.UTC(year, month - 1, day, 6, 0, 0)); // UTC midnight + 6 hours = CST midnight

  // Convert the UTC date to CST explicitly using the time zone option
  const options = {
    year: "2-digit",
    month: "short",
    day: "2-digit",
    timeZone: "America/Chicago",
  };
  return utcDate.toLocaleDateString("en-US", options).replace(",", "'");
}

const calendar = require("@/public/schedule/schedule.json");
const hw = require("@/public/schedule/hw.json");
const lab = require("@/public/schedule/lab.json");
const mp = require("@/public/schedule/mp.json");
const quiz = require("@/public/schedule/quiz.json");
const ec = require("@/public/schedule/ec.json");

export default function Home() {
  const [squirrelStyle, setSquirrelStyle] = useState({
    width: "100px", // Initial width
  });
  const [squirrelImage, setSquirrelImage] = useState("empty.png"); // Default image

  const currentWeekIdx = Math.max(
    ...calendar.filter((day) => isPastDate(day.date)).map((day) => day.week_idx)
  );
  // currentWeekIdx is not related to isPastDate or isFutureDate but a specific week index
  // const currentWeekIdx = 1;

  const currentWeek = calendar.filter((day) => day.week_idx === currentWeekIdx);

  const isOngoing = (
    startDateString,
    startTimeString,
    dueDateString,
    dueTimeString
  ) => {
    const startDateTime = new Date(`${startDateString}T${startTimeString}`);
    const dueDateTime = new Date(`${dueDateString}T${dueTimeString}`);

    const now = new Date();
    //const now = new Date("2024-09-10T12:00:00");

    return now >= startDateTime && now < dueDateTime;
  };

  const filteredHw = hw.filter((item) =>
    isOngoing(item.date, "09:50:00", item.due_date, "08:59:00")
  );
  const filteredEc = ec.filter((item) =>
    isOngoing(item.date, "09:50:00", item.due_date, "23:59:00")
  );
  const filteredLab = lab.filter((item) =>
    isOngoing(item.date, "10:00:00", item.due_date, "23:59:00")
  );
  const filteredMp = mp.filter((item) =>
    isOngoing(item.date, "09:50:00", item.due_date, "23:59:00")
  );
  const filteredQuiz = quiz.filter((item) =>
    isOngoing(item.date, "00:00:00", item.due_date, "23:59:00")
  );
  // Update the calendar to only show data before a specific date
  const filteredCalendar = calendar.filter(
    (item) => new Date(item.date) <= new Date("2024-09-28")
  );

  const ongoings = [
    ...filteredHw.map((item) => ({
      key: `HW-${item.id}`,
      topic: item.topic,
      due: item.due_date,
      time: "08:59 AM",
      link: item.link,
      type: "HW",
    })),
    ...filteredEc.map((item) => ({
      key: `EC-${item.id}`,
      topic: item.topic,
      due: item.due_date,
      time: "11:59 PM",
      link: item.link,
      type: "EC",
    })),
    ...filteredLab.map((item) => ({
      key: `Lab-${item.id}`,
      topic: item.topic,
      due: item.due_date,
      time: "11:59 PM",
      link: item.link,
      type: "Lab",
    })),
    ...filteredMp.map((item) => ({
      key: `MP-${item.id}`,
      topic: item.topic,
      due: item.due_date,
      time: "11:59 PM",
      link: item.link,
      type: "MP",
    })),
    ...filteredQuiz.map((item) => ({
      key: `Quiz-${item.id}`,
      topic: item.topic,
      due: item.due_date,
      time: "11:59 PM",
      link: item.link,
      type: "Quiz",
    })),
  ];

  useEffect(() => {
    const randomPositionAndRotation = () => {
      let randomX = Math.floor(Math.random() * 80); // Random position between 0% and 90% for X-axis
      let randomY = Math.floor(Math.random() * 18); // Random position between 0% and 90% for Y-axis
      let randomRotation = Math.floor(Math.random() * 11); // Random rotation between 0 and 360 degrees
      let widthSqur = "130px";

      if (randomX > 20 && randomX < 45) {
        randomX = randomX - 15;
      }
      if (randomX > 44 && randomX < 65) {
        randomX = randomX + 15;
      }

      if (randomRotation < 10) {
        randomRotation = 0;
      } else {
        randomRotation = 180;
      }

      let randIndex = Math.floor(Math.random() * 100); // Random rotation between 0 and 360 degrees
      if (randIndex > 30) {
        setSquirrelImage("squir.png");
      } else if (randIndex > 15) {
        setSquirrelImage("squir_cz.png");
      } else if (randIndex > 5) {
        setSquirrelImage("squir_bt.png");
        widthSqur = "230px";
      } else {
        setSquirrelImage("real_squir.jpg");
        widthSqur = "100px";
        randomY = 5;
        randomRotation = 0;
        randomX = 10;
      }

      setSquirrelStyle({
        position: "absolute",
        top: `${randomY}%`,
        left: `${randomX}%`,
        width: widthSqur,
        transform: `rotate(${randomRotation}deg)`,
        transition: "top 0.5s, left 0.5s, transform 0.5s", // Smooth transitions for fun effect
      });
    };

    randomPositionAndRotation();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <main>
      <div className="mb-10 text-center relative w-full h-[24vh] bg-blue-500">
        <img src={squirrelImage} alt="Squirrel" style={squirrelStyle} />
        <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
            Welcome to CS 128 live
          </h1>
        </div>
        <div className="absolute top-0 left-10 right-10 bottom-0 h-full bg-amber/60 dark:bg-amber/40" />
      </div>
      <div className="container max-w-[1200px] flex flex-col">
        <div className="mb-16 mx-8 flex justify-center items-center">
          <h3 className="text-xl text-center">
            This course can be challenging but the course staff and myself are
            here to help! We offer second-chance exams, flexible grading
            policies, many office hours, and an online discussion forum. See the
            syllabus for more details!
          </h3>
        </div>
        <div className="mb-16 mx-8 flex justify-center items-center">
          <h3 className="text-xl text-center">
            Please see{" "}
            <a
              className="underline"
              href="https://us.prairielearn.com/pl/course_instance/153040/assessments"
            >
              Praire Learn
            </a>{" "}
            for the most up-to-date deadlines and assignments.
          </h3>
        </div>
        <div className="flex flex-col w-full mb-8">
          <p className="font-semibold mb-2 text-lg">Semester Progress: </p>
          <Progress
            className="[&>*]:bg-blue-500 h-[15px] border-solid border border-black/80 rounded-full overflow-hidden mb-2"
            value={calculatedProgress}
            max={100}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm">Aug</span>
            <span className="text-sm">Dec</span>
          </div>
        </div>

        {/* Mobile Ongoing */}
        <div className="flex w-full sm:hidden mb-8 flex-col">
          <p className="font-bold mb-5 text-2xl">Ongoing</p>
          <ul>
            {ongoings.length === 0 ? (
              <p className="mb-2">No ongoing tasks</p>
            ) : (
              ongoings.map((ongoing) => (
                <li key={ongoing.key}>
                  <Link href={ongoing.link}>
                    <p
                      className={`p-4 mb-2 ${
                        variantStyles[ongoing.type] || "bg-gray-200"
                      }`}
                    >
                      {ongoing.topic}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="w-full flex justify-around">
          {/* Current Week Calendar */}
          <div className="w-full gap-2 mb-8 overflow-x-auto">
            <p className="font-semibold mb-5 text-lg">
              This Week&apos;s Agenda:
            </p>
            {today < startDate ? (
              <p>The course has not started yet. Please check back later.</p>
            ) : (
              <table className="table-fix w-full border-collapse">
                <thead className="h-[60px]">
                  <tr>
                    <th className="w-1/5 border border-b-2 border-x-gray/50 border-t-gray/50">
                      Date
                    </th>
                    <th className="w-1/5 border border-b-2 border-x-gray/50 border-t-gray/50">
                      Lecture Topic
                    </th>
                    <th className="w-1/5 border border-b-2 border-x-gray/50 border-t-gray/50">
                      Homework & Lab
                    </th>
                    <th className="w-1/5 border border-b-2 border-x-gray/50 border-t-gray/50">
                      MP & Exams
                    </th>
                    <th className="w-1/5 border border-b-2 border-x-gray/50 border-t-gray/50">
                      Deadline
                    </th>
                  </tr>
                </thead>
                {currentWeek.map((day, idx) => (
                  <tbody key={idx}>
                    <tr className="h-[70px]">
                      {day.day_idx % 5 === 1 ? (
                        <>
                          <td
                            className={`${
                              day.day_idx % 5 === 0
                                ? "border border-x-gray/50  border-b-2"
                                : "border border-x-gray/50 border-b-gray/50"
                            }`}
                            style={
                              day.dayoff
                                ? {
                                    backgroundColor: "#a1a1a1",
                                  }
                                : {}
                            }
                          >
                            <div className="relative flex flex-col items-start">
                              <span className="z-20 -translate-y-9 sm:-translate-y-12 top-10 border border-blue-500 rounded-xl px-3 py-1 bg-blue-500 font-medium text-white">
                                Week {day.week_idx}
                              </span>
                              <span className="mt-2 translate-x-3 -translate-y-5">
                                {day.week_day}, {formatDate(day.date)}
                              </span>
                            </div>
                          </td>
                        </>
                      ) : (
                        <td
                          className={`${
                            day.day_idx % 5 === 0
                              ? "border border-x-gray/50  border-b-2"
                              : "border border-x-gray/50 border-b-gray/50"
                          }`}
                          style={
                            day.dayoff
                              ? {
                                  backgroundColor: "#a1a1a1",
                                }
                              : {}
                          }
                        >
                          <p className="ml-3">
                            {day.week_day}, {formatDate(day.date)}
                          </p>
                        </td>
                      )}
                      <td
                        className={`${
                          day.day_idx % 5 === 0
                            ? "border border-x-gray/50  border-b-2"
                            : "border border-x-gray/50 border-b-gray/50"
                        }`}
                        style={
                          day.dayoff
                            ? {
                                backgroundColor: "#a1a1a1",
                              }
                            : day.lecture_topic
                            ? {
                                backgroundColor: "rgb(148 163 184)",
                              }
                            : {}
                        }
                      >
                        {day.lecture_topic && (
                          <div className="flex flex-col justify-center pb-2">
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.lecture_topic}
                            </p>
                            <div className="flex justify-around content-center">
                              <Link
                                href={
                                  "https://drive.google.com/drive/folders/11X2Z4soOMgYt8grNo9Ks121HjSTMoj6Z?usp=sharing"
                                }
                              >
                                <Image
                                  src={ppt}
                                  alt="ppt"
                                  className="w-6 h-6 ml-3"
                                />
                              </Link>
                              <Link
                                href={
                                  "https://mediaspace.illinois.edu/channel/Intro+to+Computer+Science+II+%28CS+128+BL1%29+%28CS+128+BL2%29+Fall+2024/350015692"
                                }
                              >
                                <Image
                                  src={video}
                                  alt="video"
                                  className="w-6 h-6 ml-3"
                                />
                              </Link>
                            </div>
                          </div>
                        )}
                      </td>
                      <td
                        className={`${
                          day.day_idx % 5 === 0
                            ? "border border-x-gray/50  border-b-2"
                            : "border border-x-gray/50 border-b-gray/50"
                        }`}
                        style={
                          day.dayoff
                            ? {
                                backgroundColor: "#a1a1a1",
                              }
                            : day.hw_topic
                            ? {
                                backgroundColor: "rgb(59 130 246)",
                              }
                            : day.lab_topic
                            ? {
                                backgroundColor: "rgb(234 179 8)",
                              }
                            : {}
                        }
                      >
                        {day.hw_topic && (
                          <Link href={day.hw_link}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.hw_topic}
                            </p>
                          </Link>
                        )}
                        {day.lab_topic && (
                          <Link href={day.lab_link}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.lab_topic}
                            </p>
                          </Link>
                        )}
                      </td>
                      <td
                        className={`${
                          day.day_idx % 5 === 0
                            ? "border border-x-gray/50  border-b-2"
                            : "border border-x-gray/50 border-b-gray/50"
                        }`}
                        style={
                          day.dayoff
                            ? {
                                backgroundColor: "#a1a1a1",
                              }
                            : day.mp_topic
                            ? {
                                backgroundColor: "rgb(34 197 94)",
                              }
                            : day.ec_topic
                            ? {
                                backgroundColor: "rgb(240 139 213)",
                              }
                            : day.quiz_topic
                            ? {
                                backgroundColor: "rgb(239 68 68)",
                              }
                            : {}
                        }
                      >
                        {day.mp_topic && (
                          <Link href={day.mp_link}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.mp_topic}
                            </p>
                          </Link>
                        )}
                        {day.quiz_topic && (
                          <Link href={day.quiz_link[0]}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.quiz_topic}
                            </p>
                          </Link>
                        )}
                        {day.ec_topic && (
                          <Link href={day.ec_link}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.ec_topic}
                            </p>
                          </Link>
                        )}
                      </td>
                      <td
                        className={`${
                          day.day_idx % 5 === 0
                            ? "border border-x-gray/50  border-b-2 "
                            : "border border-x-gray/50 border-b-gray/50"
                        }`}
                        style={
                          day.dayoff
                            ? {
                                backgroundColor: "#a1a1a1",
                              }
                            : day.hw_due_topic
                            ? {
                                backgroundColor: "rgb(59 130 246)",
                              }
                            : day.lab_due_topic
                            ? {
                                backgroundColor: "rgb(234 179 8)",
                              }
                            : day.mp_due_topic
                            ? { backgroundColor: "rgb(34 197 94)" }
                            : day.ec_due_topic
                            ? {
                                backgroundColor: "rgb(240 139 213)",
                              }
                            : {}
                        }
                      >
                        {day.hw_due_topic && (
                          <Link href={day.hw_due_link}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.hw_due_topic} <br></br>
                              <br></br> Due - 8:59 AM
                            </p>
                          </Link>
                        )}
                        {day.lab_due_topic && (
                          <Link href={day.lab_due_link}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.lab_due_topic} <br></br>
                              <br></br> Due - 11:59 PM
                            </p>
                          </Link>
                        )}
                        {day.mp_due_topic && (
                          <Link href={day.mp_due_link}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.mp_due_topic} <br></br>
                              <br></br> Due - 11:59 PM
                            </p>
                          </Link>
                        )}
                        {day.ec_due_topic && (
                          <Link href={day.ec_due_link}>
                            <p className="p-4 mb-2 ml-3 text-white font-semibold">
                              {day.ec_due_topic}
                              <br></br> Due - 11:59 PM
                            </p>
                          </Link>
                        )}
                      </td>
                    </tr>
                  </tbody>
                ))}
              </table>
            )}
          </div>

          {/* Ongoing Assignments */}
          <div className="hidden sm:flex w-full sm:w-3/12 mb-8 flex-col ml-32">
            <p className="font-semibold mb-5 text-lg">Ongoing</p>
            <ul>
              {ongoings.length === 0 ? (
                <p className="mb-2">No ongoing tasks</p>
              ) : (
                ongoings.map((ongoing) => (
                  <li key={ongoing.key}>
                    <Link href={ongoing.link}>
                      <p
                        className={`p-4 mb-2 ${
                          variantStyles[ongoing.type] || "bg-gray-200"
                        }`}
                      >
                        {ongoing.topic}
                      </p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
