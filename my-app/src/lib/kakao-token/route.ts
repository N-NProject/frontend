import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { code } = await request.json();

  try {
    const response = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.NEXT_PUBLIC_KAKAO_REST_KEY, // 카카오 REST API 키
          redirect_uri: process.env.NEXT_PUBLIC_KAKAO_LOGIN_REDIRECT_URI, // 리디렉션 URI
          code,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { access_token } = response.data;
    return NextResponse.json({ access_token });
  } catch (error) {
    console.error("토큰 요청 중 오류 발생:", error);
    return NextResponse.json({ error: "토큰 요청 실패" }, { status: 500 });
  }
}
