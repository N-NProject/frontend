"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios"; // axios 수정

import { Board } from "@/types/boards";

import thumbnail from "@/assets/mypage/thumbnail.svg";
import location from "@/assets/mypage/ion_location.svg";
import pencil from "@/assets/mypage/pencil.svg";
import PostPreview from "@/components/PostPreview";

const getMypageData = async () => {
  const res = await axios.get("http://localhost:8000/api/v1/users/mypage", {
    withCredentials: true,
  });
  return res.data.result;
};

const MyPage = () => {
  const { data: mypageData, isLoading } = useQuery({
    queryKey: ["mypage"],
    queryFn: getMypageData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  useEffect(() => {
    console.log("Loading:", isLoading);
    console.log("Data:", mypageData);
  }, [isLoading, mypageData]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      // 로그아웃 성공 후 로그인 페이지로 리다이렉트
      window.location.href = "/login"; // 로그인 페이지로 이동
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <main className="flex">
      <div className="container flex flex-col max-w-full min-h-screen items-center bg-white">
        <div className="namecontainer flex box-border w-[30rem] mt-[2rem] xl:w-[50rem] xl:ml-[-15rem] lg:w-[45rem] lg:ml-0 md:w-[40rem] md:ml-0 ">
          <Image src={thumbnail} alt="썸네일" />
          <div className="m-[2rem]">
            <div className="flex mb-[1rem] ">
              <h1 className="nickname text-[1.5rem] font-bold mr-[0.5rem]">
                {mypageData?.userName || "이름"}
              </h1>
              <button>
                <Image src={pencil} alt="편집" />{" "}
              </button>
            </div>

            <Link
              className="flex items-center text-gray text-[1rem] "
              href="/location"
            >
              <Image src={location} alt="위치 아이콘" />
              <ins>위치 정보를 입력하세요.</ins>
            </Link>
          </div>
        </div>
        <div className="line border-lightgray border-[0.01rem] mt-[1.5rem] mb-[1rem] w-[30rem] xl:w-[70rem] lg:w-[50rem] md:w-[40rem]"></div>
        <div className="flex flex-col mx-[9rem] w-[30rem] h-full xl:w-[67.75rem] lg:w-[50rem] md:w-[40rem]">
          <h1 className="mb-[2rem] text-[20px]">작성한 게시글</h1>

          <div className="write_post overflow-y-hidden">
            {mypageData?.createdPosts.map((data: Board) => (
              <PostPreview
                key={data.id}
                title={data.title}
                tag={[data.category]}
                date={data.date}
                time={data.startTime}
                maxCapacity={data.maxCapacity}
                locationName={data.location.locationName}
                status={data.status}
                currentPerson={data.currentPerson}
              />
            ))}
          </div>

          <h1 className="mt-[2rem] mb-[2rem] text-[20px]">참여한 게시글</h1>
          <div className="write_post flex flex-col justify-center overflow-y-hidden">
            <div className="flex mb-3">123</div>
            <div className="flex">123</div>
          </div>
        </div>

        {/* 로그아웃 버튼 추가 */}
        <button
          onClick={handleLogout}
          className="w-[22.5rem] h-[3rem] rounded-[0.25rem] mb-7  bg-red-400 hover:bg-red-700"
        >
          <span className="text-base text-white font-semibold">로그아웃</span>
        </button>
      </div>
    </main>
  );
};

export default MyPage;
