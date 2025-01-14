"use client";

import PostPreview from "@/components/PostPreview";
import MainTab from "@/components/MainTab";
import api from "@/utils/api";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Board } from "@/types/boards";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading.json";

const getBoards = async (page: number, limit: number) => {
  const res = await api.get("/api/v1/boards/", {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
};

const Boards = () => {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState<"OPEN" | "CLOSE" | "">(
    "",
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);

  const updateLimit = () => {
    if (window.innerWidth >= 1280) {
      setLimit(8);
    } else {
      setLimit(4);
    }
  };

  useEffect(() => {
    updateLimit(); // 초기 로드 시 updateLimit 호출
    window.addEventListener("resize", updateLimit);

    return () => {
      window.removeEventListener("resize", updateLimit);
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["boards", page, limit],
    queryFn: () => getBoards(page, limit),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const posts = data?.data || [];
  const totalPage = data?.totalPage || 0;
  console.log(posts);
  useEffect(() => {
    console.log("Loading:", isLoading);
    console.log("Data:", posts);
  }, [isLoading, posts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleStatusChange = (status: "OPEN" | "CLOSE") => {
    setSelectedStatus((prevStatus: "OPEN" | "CLOSE" | "") =>
      prevStatus === status ? "" : status,
    );
  };

  const filteredData = posts.filter((data: Board) => {
    const categoryMatch =
      selectedCategory === "전체" || data.category === selectedCategory;

    const statusMatch = selectedStatus === "" || data.status === selectedStatus;

    return categoryMatch && statusMatch;
  });

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="flex justify-center lg:justify-start mt-4 md:mt-0 lg:pl-[4rem] xl:pl-[6rem] py-4 md:py-7">
        <MainTab onCategoryChange={handleCategoryChange} />
      </div>
      <div className="flex justify-center lg:justify-start gap-[0.75rem] lg:gap-[1.25rem] px-[2rem] lg:px-[6rem] xl:px-[8rem]">
        <button
          onClick={() => handleStatusChange("OPEN")}
          className={`w-[5rem] lg:w-[6.25rem] h-[2rem] lg:h-[2.25rem] border border-1 rounded-[1.25rem] ${
            selectedStatus === "OPEN"
              ? "border-darkpink bg-pink"
              : "border-gray"
          }`}
        >
          <span className="text-xs">모집 중</span>
        </button>
        <button
          onClick={() => handleStatusChange("CLOSE")}
          className={`w-[5rem] lg:w-[6.25rem] h-[2rem] lg:h-[2.25rem] border border-1 rounded-[1.25rem] ${
            selectedStatus === "CLOSE"
              ? "border-darkpink bg-pink"
              : "border-gray"
          }`}
        >
          <span className="text-xs">모집 종료</span>
        </button>
      </div>
      <div className="flex justify-center items-center py-[1rem]">
        {isLoading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Lottie
              animationData={loadingAnimation}
              loop
              className="w-[100px] h-[100px]"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6 py-[1rem]">
            {filteredData.map((data: Board) => (
              <PostPreview
                key={data.id}
                boardId={data.id}
                title={data.title}
                tag={[data.category]}
                date={data.date}
                maxCapacity={data.maxCapacity}
                locationName={data.location.locationName}
                status={data.status}
                currentPerson={data.currentPerson}
                link={`/post/${data.id}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="fixed bottom-16 md:bottom-2 w-full py-2">
        <Stack
          spacing={2}
          className="flex justify-center items-center md:mr-[5rem]"
        >
          <Pagination
            count={totalPage}
            page={page}
            onChange={handlePageChange}
          />
        </Stack>
      </div>
    </main>
  );
};

export default Boards;
