"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { Board } from "@/types/boards";
import thumbnail from "@/assets/mypage/thumbnail.svg";
import pencil from "@/assets/mypage/pencil.svg";
import PostPreview from "@/components/PostPreview";
import { useRouter } from "next/navigation";

const getMypageData = async () => {
  const res = await api.get("/api/v1/users/", {
    withCredentials: true,
  });
  return res.data; // 수정: 전체 데이터를 반환
};

const MyPage = () => {
  const router = useRouter();
  const {
    data: mypageData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mypage"],
    queryFn: getMypageData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  useEffect(() => {
    if (isLoading) return; // 데이터 로딩 중일 때는 아무 작업도 하지 않음.
    if (isError) {
      alert("로그인 후 이용 가능합니다.");
      router.push("/login");
    }
    console.log("Loading:", isLoading);
    console.log("Data:", mypageData);
  }, [isError, isLoading, mypageData, router]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(
        "/api/v1/auth/logout",
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "kakao_access_token",
            )}`,
          },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      console.log("로그아웃 성공");

      // 쿠키 삭제 함수
      const deleteAllCookies = () => {
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie =
            name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      };

      // 로컬 스토리지에서 kakao_access_token 삭제
      localStorage.removeItem("kakao_access_token");

      // 모든 쿠키 삭제
      deleteAllCookies();

      // 로그아웃 후 로그인 페이지로 이동
      window.location.href = "/login";
    },
    onError: error => {
      console.error("로그아웃 중 오류 발생:", error.message);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate(); // 로그아웃 함수 호출
  };

  return (
    <main className="flex">
      <div className="container flex flex-col max-w-full min-h-screen items-center bg-white">
        <div className="namecontainer flex box-border w-[30rem] mt-[2rem] xl:w-[50rem] xl:ml-[-15rem] lg:w-[45rem] lg:ml-0 md:w-[40rem] md:ml-0">
          <Image src={thumbnail} alt="썸네일" />
          <div className="m-[2rem]">
            <div className="flex mb-[1rem]">
              <h1 className="nickname text-[1.5rem] font-bold mr-[0.5rem]">
                {mypageData?.username || "이름"}
              </h1>
              <button>
                <Image src={pencil} alt="편집" />
              </button>
            </div>
          </div>
        </div>

        <div className="line border-lightgray border-[0.01rem] mt-[1.5rem] mb-[1rem] w-[30rem] xl:w-[70rem] lg:w-[50rem] md:w-[40rem]"></div>

        <div className="flex flex-col mx-[9rem] w-[30rem] h-full xl:w-[67.75rem] lg:w-[50rem] md:w-[40rem]">
          <h1 className="mb-[2rem] text-[20px]">작성한 게시글</h1>

          <div className="write_post overflow-y-auto h-[20rem]  gap-6 p-[1.5rem] grid grid-cols-1 min-h-9 xl:grid-flow-col xl:overflow-x-auto xl:grid-cols-none xl:grid-rows-2 xl:gap-8 ">
            {mypageData?.createdBoards?.data.map((data: Board) => (
              <PostPreview
                key={data.id}
                boardId={data.id}
                title={data.title}
                tag={[data.category]}
                date={data.date}
                maxCapacity={data.maxCapacity}
                locationName={data.location?.locationName || "위치 없음"}
                status={data.status}
                currentPerson={data.currentPerson}
                link={`/post/${data.id}`}
              />
            ))}
          </div>

          <h1 className="mt-[2rem] mb-[2rem] text-[20px]">참여한 게시글</h1>
          <div className="join_post overflow-y-auto h-[20rem]  gap-6 p-[1.5rem] grid grid-cols-1 min-h-9 xl:grid-flow-col xl:overflow-x-auto xl:grid-cols-none xl:grid-rows-2 xl:gap-8 ">
            {mypageData?.joinedBoards?.data.length === 0 ? (
              <div>참여한 게시글이 없습니다.</div>
            ) : (
              mypageData?.joinedBoards?.data.map((data: Board) => (
                <PostPreview
                  key={data.id}
                  boardId={data.id} // boardId 추가
                  title={data.title}
                  tag={[data.category]}
                  date={data.date}
                  maxCapacity={data.maxCapacity}
                  locationName={data.location?.locationName || "위치 없음"} // 위치가 없을 경우 기본값 설정
                  status={data.status} // status가 JSON에 없을 경우 수정 필요
                  currentPerson={data.currentPerson} // currentPerson이 JSON에 없을 경우 수정 필요
                />
              ))
            )}
          </div>
        </div>

        {/* 로그아웃 버튼 추가 */}
        <button
          onClick={handleLogout}
          className="md:w-[22.5rem] md:h-[3rem] md:rounded-[0.25rem] md:mb-7 w-[8rem] h-[2rem] rounded-[1rem]  bg-[lightpink] hover:bg-darkpink absolute top-[4rem] right-[6rem] md:static md:top-auto md:right-auto md:mr-0"
        >
          <span className="text-base text-white font-semibold">로그아웃</span>
        </button>
      </div>
    </main>
  );
};

export default MyPage;
