"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BackgroundImage from "@/assets/post/background.png";
import MegaphoneImage from "@/assets/post/megaphone.png";
import EditModalBox from "@/components/EditModalBox";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

const getPostData = async (id: number) => {
  const res = await api.get(`/api/v1/boards/${id}`, { withCredentials: true });

  return res.data;
};

const Post = ({ params }: { params: { slug: number } }) => {
  const [currentPerson, setCurrentPerson] = useState<number>(1);
  const [locationAddress, setLocationAddress] = useState<string>("");
  //const [postData, setPostData] = useState<Object>({});
  const [showModal, setShowModal] = useState(false);
  // let locationAddress = ""
  const router = useRouter();

  const deletePostData = async (id: number) => {
    const res = await api.delete(`/api/v1/boards/${id}`, {
      withCredentials: true,
    });

    return res.data;
  };

  const joinChatRoom = async (id: number) => {
    const res = await api.post(
      `/api/v1/chatrooms/join/${id}`,
      {},
      { withCredentials: true },
    );

    return res.data;
  };

  // const getMutation = useMutation({
  //   mutationFn: getPostData,
  //   onSuccess: data => {
  //     setPostData(data);
  //     setCurrentPerson(data.currentCapacity);
  //     loadKakaoMap(data.location.latitude, data.location.longitude);
  //   },
  //   onError: error => {
  //     console.log(error.message);
  //   },
  // });

  const deleteMutation = useMutation({
    mutationFn: deletePostData,
    onSuccess: () => {
      router.push(`/`);
    },
    // onError: (error: ErrorType<object>) => {
    //   console.log(error.message);
    // },
  });

  const joinMutation = useMutation({
    mutationFn: joinChatRoom,
    onSuccess: (data: { chatRoomId: number }) => {
      router.push(`/chat/${data.chatRoomId}`);
    },
    onError: () => {
      alert("로그인한 회원만 참여 가능합니다.\n로그인 페이지로 이동합니다.");
      router.push("/login");
    },
  });

  const clickEditButton = () => {
    setShowModal(!showModal);
  };

  const clickDeleteButton = () => {
    deleteMutation.mutate(params.slug);
  };

  const clickJoinButton = () => {
    if (postData.status === "CLOSE") {
      alert("해당 모집글은 기간이 종료되어 참여 불가능합니다.");
    } else if (currentPerson === postData.maxCapacity) {
      alert("해당 모집글은 인원이 마감되어 참여 불가능합니다.");
    } else {
      joinMutation.mutate(params.slug);
    }
  };

  const loadKakaoMap = (latitude: string, longitude: string) => {
    const kakaoMapScript = document.createElement("script");
    kakaoMapScript.async = false;
    kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=4b5f228cb3b8bf6903521cc0f6f67769&autoload=false&libraries=services`;
    document.head.appendChild(kakaoMapScript);

    const onLoadKakaoAPI = () => {
      window.kakao.maps.load(() => {
        const position = new window.kakao.maps.LatLng(latitude, longitude);

        const marker = {
          position: position,
        };

        const staticMapContainer = document.getElementById("staticMap");

        const staticMapOption = {
          center: position,
          level: 3,
          marker: marker,
        };

        new window.kakao.maps.StaticMap(staticMapContainer, staticMapOption);

        const geocoder = new window.kakao.maps.services.Geocoder();
        console.log(postData.location?.longitude);
        console.log(postData.location?.latitude);

        geocoder.coord2Address(
          longitude,
          latitude,
          function (
            result: {
              address: {
                address_name: string;
                region_1depth_name: string;
                region_2depth_name: string;
                region_3depth_name: string;
              };
              road_address?: {
                address_name: string;
                building_name: string;
              };
            }[],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: any,
          ) {
            if (status === window.kakao.maps.services.Status.OK) {
              console.log(result);
              console.log(typeof result);
              setLocationAddress(result[0].address.address_name);
              // locationAddress = result[0].address.address_name;
            }
          },
        );
      });
    };

    kakaoMapScript.addEventListener("load", onLoadKakaoAPI);
  };

  const { data, isSuccess } = useQuery({
    queryKey: ["postData", params.slug],
    queryFn: () => getPostData(params.slug),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  // onSuccess: data => {
  //   setPostData(data);
  //   setCurrentPerson(data.currentCapacity);
  //   loadKakaoMap(data.location.latitude, data.location.longitude);
  // },
  // onError: error => {
  //   console.log(error.message);
  // },
  //);

  const postData = data || {};

  useEffect(() => {
    if (isSuccess && postData) {
      setCurrentPerson(postData.currentPerson);
      loadKakaoMap(postData.location.latitude, postData.location.longitude);
    }
  }, [isSuccess, postData]);

  //loadKakaoMap(data?.location.latitude, data?.location.longitude);

  useEffect(() => {
    //getMutation.mutate(params.slug);

    // const eventSource = new EventSource(
    //   `https://meetingsquare.site/sse/board/${params.slug}`,
    // );

    const eventSource = new EventSource(
      `https://meetingsquare.site/sse/board/${params.slug}`
    );

    eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setCurrentPerson(data.currentPerson);
    };

    eventSource.onerror = (error: Event) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div id="container" className="flex h-full max-w-full flex-col">
      <div className="relative w-full h-48">
        <Image src={BackgroundImage} alt="Background Image" fill priority />
      </div>
      <div className="place-items-center rounded-t-[4rem] bg-white relative bottom-14 ">
        <div className="md:flex-none flex md:justify-normal justify-center md:items-start items-center">
          <div className="h-20 bg-lightpink flex items-center rounded-3xl px-6 md:ml-20 drop-shadow-md relative bottom-10 ">
            <Image
              src={MegaphoneImage}
              alt="Background Image"
              width={45}
              height={45}
              priority
            />
            <div className="w-full flex justify-center font-semibold text-xl mr-8 ">
              {postData.title}
            </div>
          </div>
        </div>
        <div className="flex md:flex-row flex-col justify-between md:h-[30rem] h-[32rem] md:mx-20 mx-10 mb-5 overflow-auto">
          <div className="md:mr-10 md:w-[35rem]">
            <div className="mb-2">
              <p className="w-fit px-3 py-1 inline-block rounded-2xl font-semibold border-solid border-2 border-pink">
                모집
              </p>
              <p className="inline-block ml-3 text-lg">
                {postData.user?.username}
              </p>
            </div>
            <div className="mb-2">
              <p className="w-fit px-3 py-1 inline-block rounded-2xl font-semibold border-solid border-2 border-pink">
                날짜
              </p>
              <p className="inline-block ml-3 text-lg">
                {postData.date}{" "}
                {postData.startTime ? postData.startTime.slice(0, 5) : ""}
              </p>
            </div>
            <div className="mb-2">
              <p className="w-fit px-3 py-1 inline-block rounded-2xl font-semibold border-solid border-2 border-pink">
                인원
              </p>
              <p className="inline-block ml-3 text-lg">
                {currentPerson} / {postData.maxCapacity}
              </p>
            </div>
            <div className="mb-5">
              <p className="w-fit px-3 py-1 inline-block rounded-2xl font-semibold border-solid border-2 border-pink">
                장소
              </p>
              <p className="inline-block ml-3 text-lg">
                {postData.location?.locationName}
              </p>
            </div>
            <hr className="mb-5 border-lightgray" />
            <div className="md:mb-2 mb-10">
              <p className="w-fit px-3 py-1 mb-2 rounded-2xl font-semibold border-solid border-2 border-pink">
                상세내용
              </p>
              <p className="ml-3 text-lg">{postData.description}</p>
            </div>
          </div>
          <div className="md:w-[35rem]">
            <p className="w-fit px-3 py-1 inline-block mb-2 rounded-2xl font-semibold border-solid border-2 border-pink">
              위치
            </p>
            <p className="inline-block ml-3 text-lg">{locationAddress}</p>
            <div
              id="staticMap"
              className="2xl:h-[25rem] xl:h-[23rem] l:h-[21rem] md:h-[19rem] sm:h-[17rem] h-[15rem]"
            ></div>
          </div>
        </div>
        <div className="flex items-center justify-center md:min-h-24 min-h-12">
          {postData.editable ? (
            <div className="flex space-x-7">
              <button
                className="h-fit bg-darkpink text-lg font-semibold text-white rounded-lg py-2 md:px-20 px-10 cursor-pointer"
                onClick={clickEditButton}
              >
                수정
              </button>
              <button
                className="h-fit bg-darkpink text-lg font-semibold text-white rounded-lg py-2 md:px-20 px-10 cursor-pointer"
                onClick={clickDeleteButton}
              >
                삭제
              </button>
            </div>
          ) : (
            <button
              className="h-fit bg-darkpink text-lg font-semibold text-white rounded-lg py-2 px-20 cursor-pointer"
              onClick={clickJoinButton}
            >
              지금 당장 참여하기 ({currentPerson}/{postData.maxCapacity})
            </button>
          )}
        </div>
      </div>
      {showModal && (
        <EditModalBox postData={postData} clickModal={clickEditButton} />
      )}
    </div>
  );
};

export default Post;
