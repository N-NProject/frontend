"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import title from "@/assets/nav/title.svg";
import { CgAdd } from "react-icons/cg";
import { VscAccount } from "react-icons/vsc";
import { IoIosLogOut } from "react-icons/io";
import icons_chat from "@/assets/chat/icons_chat.svg";
import Sidebar from "@/components/SideBar";

const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSidebarTab, setCurrentSidebarTab] = useState(null);

  const watchScreen = () => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", watchScreen);
    return () => {
      window.removeEventListener("resize", watchScreen);
    };
  }, []);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    currentSidebarTab,
    setCurrentSidebarTab,
  };
};

const NavBarWeb: React.FC = () => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    currentSidebarTab,
    setCurrentSidebarTab,
  } = useSidebar();

  const router = useRouter();

  const handleSidebarToggle = (tab: string) => {
    if (isSidebarOpen && currentSidebarTab === tab) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
      setCurrentSidebarTab(tab);
    }
  };

  

  return (
    <div className="bg-white w-20 z-0 h-screen md:flex hidden flex-col items-center border-solid border-r border-lightgray">
      <Image className="bg-white w-20 h-30" src={title} alt="title" />
      <nav></nav>
      <div className="h-[100rem] mt-[1rem] flex flex-col justify-around">
        <Link href="/boards">
          <button
            onClick={() => handleSidebarToggle("linksTab")}
            className={`p-2 transition-colors rounded-lg shadow-md hover:bg-red-700 hover:text-white focus:outline-none focus:ring focus:ring-darkpink focus:ring-offset-white focus:ring-offset-2 text-gray-500 bg-darkpink ${
              isSidebarOpen && currentSidebarTab === "linksTab"
                ? "text-white bg-primary"
                : "text-gray-500 bg-white"
            }`}
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              ></path>
            </svg>
          </button>
        </Link>

        <Link href="/chat">
          {/* 초기 사이드바 배포시 지우세여 */}
          <button
            onClick={() => handleSidebarToggle("messagesTab")}
            className={`p-2 transition-colors rounded-lg shadow-md hover:bg-red-700 hover:text-white focus:outline-none focus:ring focus:ring-darkpink focus:ring-offset-white focus:ring-offset-2 text-gray-500 bg-darkpink
               ${
                 isSidebarOpen && currentSidebarTab === "messagesTab"
                   ? "text-white bg-primary"
                   : "text-gray-500 bg-white"
               }
            `}
          >
            <span className="sr-only">Toggle message panel</span>
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              ></path>
            </svg>
          </button>
          {/* <Sidebar /> */}
        </Link>
        <Link href="/alarm">
          <button
            onClick={() => handleSidebarToggle("notificationsTab")}
            className={`p-2 transition-colors rounded-lg shadow-md hover:bg-red-700 hover:text-white focus:outline-none focus:ring focus:ring-darkpink focus:ring-offset-white focus:ring-offset-2 text-gray-500 bg-darkpink ${
              isSidebarOpen && currentSidebarTab === "notificationsTab"
                ? "text-white bg-primary"
                : "text-gray-500 bg-white"
            }`}
          >
            <span className="sr-only">Toggle notifications panel</span>
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
          </button>
        </Link>
      </div>

      <div className="h-96 mt-80 flex flex-col justify-around items-center mb-[4rem]">
        <Link className="mb-[2rem]" href="/write">
          <button
            onClick={() => handleSidebarToggle("writeTab")}
            className={`p-2 transition-colors rounded-lg shadow-md hover:bg-red-700 hover:text-white focus:outline-none focus:ring focus:ring-darkpink focus:ring-offset-white focus:ring-offset-2 text-gray-500 bg-darkpink ${
              isSidebarOpen && currentSidebarTab === "writeTab"
                ? "text-white bg-primary"
                : "text-gray-500 bg-white"
            }`}
          >
            <CgAdd className="w-7 h-7" />
          </button>
        </Link>
        <Link href="/mypage">
          <button
            onClick={() => handleSidebarToggle("mypageTab")}
            className={`p-2 transition-colors rounded-lg shadow-md hover:bg-red-700 hover:text-white focus:outline-none focus:ring focus:ring-darkpink focus:ring-offset-white focus:ring-offset-2 text-gray-500 bg-darkpink ${
              isSidebarOpen && currentSidebarTab === "mypageTab"
                ? "text-white bg-primary"
                : "text-gray-500 bg-white"
            }`}
          >
            <VscAccount className="w-6 h-6" />
          </button>
        </Link>

        <button
          onClick={() => handleSidebarToggle("")}
          className={`mt-10 p-2 transition-colors rounded-lg shadow-md hover:bg-red-700 hover:text-white focus:outline-none focus:ring focus:ring-darkpink focus:ring-offset-white focus:ring-offset-2 text-gray-500 bg-darkpink ${
            isSidebarOpen && currentSidebarTab === ""
              ? "text-white bg-primary"
              : "text-gray-500 bg-white"
          }`}
        >
          <IoIosLogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default NavBarWeb;
