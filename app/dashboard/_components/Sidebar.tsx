"use client";

import React from "react";
import { navList } from "../_constants/navList";
import { usePathname } from "next/navigation";
import Link from "next/link";
import WordRotate from "@/components/ui/word-rotate";

const Sidebar = () => {
  const path = usePathname();
  return (
    <div className="fixed h-full md:w-64 p-5 shadow-md">
      <WordRotate
        className="text-4xl font-bold text-black dark:text-white text-center"
        words={["AI", "Course", "Generator"]}
      />
      <hr className="my-5" />

      <ul>
        {navList.map((item) => (
          <Link href={item.route} key={item.id}>
            <div
              className={`flex items-center gap-2 text-gray-600 p-3 cursor-pointer hover:bg-gray-100 hover:text-black rounded-lg mb-3 ${
                item.route === path && "bg-gray-100 text-black"
              }`}
            >
              <div className="text-2xl">
                <item.icon />
              </div>
              <h2>{item.name}</h2>
            </div>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
