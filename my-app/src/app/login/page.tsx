"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const redirectUri = "http://localhost:8000/api/v1/auth/redirect";
const scope = ["profile_nickname"].join(",");

export default function LoginPage() {
  const router = useRouter();
  const [isKakaoInitialized, setIsKakaoInitialized] = useState(false);

  useEffect(() => {
    const loadKakaoSDK = () => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined") return;
        if (window.Kakao) return resolve(window.Kakao);

        const script = document.createElement("script");
        script.src = "https://developers.kakao.com/sdk/js/kakao.js";
        script.onload = () => {
          if (window.Kakao) {
            resolve(window.Kakao);
          } else {
            reject("Kakao SDK 로드 실패");
          }
        };
        script.onerror = () => {
          console.error("Kakao SDK 스크립트 로드에 실패했습니다.");
          reject("Kakao SDK 로드 실패");
        };
        document.head.appendChild(script);
      });
    };

    loadKakaoSDK()
      .then(Kakao => {
        if (!Kakao.isInitialized()) {
          // 환경 변수가 제대로 로드되는지 확인
          console.log("Kakao JS Key:", process.env.NEXT_PUBLIC_KAKAO_JS_KEY);

          // Kakao SDK 초기화
          Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);

          // 초기화 여부 확인
          if (Kakao.isInitialized()) {
            console.log("Kakao SDK 초기화되었습니다.");
            setIsKakaoInitialized(true); // 초기화 성공 시 상태 업데이트
          }
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const kakaoLoginHandler = () => {
    // 로그인 요청
    window.Kakao.Auth.authorize({
      redirectUri,
      scope,
    });

    console.log("카카오 로그인 요청");
    router.replace("/boards");
  };



  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/logout",
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
      localStorage.removeItem("kakao_access_token");
      router.push("/login"); // 로그아웃 후 홈 페이지로 이동
    },
    onError: error => {
      console.error("로그아웃 중 오류 발생:", error.message);
    },
  });

  const kakaoLogoutHandler = () => {
    // 로그아웃 요청
    logoutMutation.mutate();
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="flex pt-36 pb-12 justify-center items-center">
        <Image src={Logo} alt="Logo" width={400} height={400} />
      </div>
      <div className="flex justify-center gap-4">
        {/* SDK가 초기화될 때까지 로그인 버튼을 비활성화 */}
        <button
          onClick={kakaoLoginHandler}
          className={`w-[22.5rem] h-[3rem] rounded-[0.25rem] ${
            isKakaoInitialized ? "bg-yellow-400" : "bg-gray-400"
          }`}
          disabled={!isKakaoInitialized}
        >
          <span className="text-base font-semibold">Kakao로 간편 로그인</span>
        </button>

        <button
          onClick={kakaoLogoutHandler}
          className="w-[22.5rem] h-[3rem] rounded-[0.25rem] bg-red-400"
        >
          <span className="text-base font-semibold">로그아웃</span>
        </button>
      </div>
    </main>
  );
}
