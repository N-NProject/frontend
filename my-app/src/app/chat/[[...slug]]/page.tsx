"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import api from "@/utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import io from "socket.io-client";
import icons_chat from "@/assets/chat/icons_chat.svg";
import back from "@/assets/chat/icons_back.svg";
import exit from "@/assets/chat/icons_exit.svg";
import PostPreview from "@/components/PostPreview";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import sendChatProps from "@/types/chat";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading.json";

interface ChatRoom {
  id: number;
  board: {
    boardId: number;
    title: string;
    category: string;
    date: string;
    currentPerson: number;
    maxCapacity: number;
    location: {
      locationName: string;
    };
    status: "OPEN" | "CLOSE";
  };
}

interface Message {
  nickName: string;
  content: string;
  chatRoomId: number;
}

type MessagesByChatRoom = {
  [key: number]: { nickname: string; content: string }[];
};

// 사용자 정보를 가져오는 함수 (username 가져옴)
const fetchUserInfo = async () => {
  const response = await api.get("/api/v1/users", {
    withCredentials: true,
  });
  return response.data.username; // username 반환
};

const fetchChatRooms = async () => {
  const response = await api.get("/api/v1/users/chatrooms", {
    withCredentials: true,
  });
  return response.data;
};

const fetchChatRoomDetails = async (chatRoomId: number) => {
  const response = await api.get(`/api/v1/chatrooms/${chatRoomId}`, {
    withCredentials: true,
  });
  return response.data;
};

const sendMessage = async ({ chatRoomId, content }: sendChatProps) => {
  const response = await api.post(
    `/api/v1/chatrooms/${chatRoomId}/messages`,
    { content },
    {
      withCredentials: true,
    },
  );
  return response.data;
};

const leaveChatRoom = async (chatRoomId: number) => {
  const response = await api.delete(`/api/v1/chatrooms/${chatRoomId}/leave`, {
    withCredentials: true,
  });
  return response.data;
};

const Chat = ({ params }: { params: { slug?: string[] } }) => {
  const [selectedChatRoom, setSelectedChatRoom] = useState<number | null>(null);
  const [pastMessages, setPastMessages] = useState<MessagesByChatRoom>({});
  const [newMessages, setNewMessages] = useState<MessagesByChatRoom>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [currentUserNickname, setCurrentUserNickname] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chatListRef = useRef<HTMLDivElement | null>(null); // 목록 스크롤 Ref
  const chatRoomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // 채팅 버튼 클릭 시 목록으로 이동
  const handleChatButtonClick = () => {
    // 모바일에서 뒤로가기와 유사하게 작동
    setSelectedChatRoom(null);
  };

  // slug 값 확인 후 selectedChatRoom 설정
  useEffect(() => {
    const chatRoomId = params?.slug ? parseInt(params.slug[0], 10) : null;
    setSelectedChatRoom(chatRoomId);
  }, [params?.slug]);

  //현재 사용자 nickname 저장
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const nickname = await fetchUserInfo();
        setCurrentUserNickname(nickname);
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다:", error);
      }
    };
    getUserInfo();
  }, []);

  // 채팅방 목록 데이터 가져오기
  const { data, isLoading, error } = useQuery({
    queryKey: ["chatRooms"],
    queryFn: fetchChatRooms,
  });

  // 선택된 채팅방의 세부 정보 가져오기
  const { data: chatRoomDetailsData } = useQuery({
    queryKey: ["chatRoomDetails", selectedChatRoom],
    queryFn: () => fetchChatRoomDetails(selectedChatRoom!),
    enabled: !!selectedChatRoom,
  });

  const mutation = useMutation({ mutationFn: sendMessage });

  const leaveMutation = useMutation({
    mutationFn: leaveChatRoom,
    onSuccess: () => {
      router.push("/chat"); // 채팅방을 나가면 기본 채팅 경로로 리다이렉트
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    },
  });

  // 나가기 버튼
  const handleLeaveChatRoom = () => {
    setIsModalOpen(true);
  };
  const handleConfirmLeave = () => {
    setIsModalOpen(false);
    if (selectedChatRoom) {
      leaveMutation.mutate(selectedChatRoom);
    }
  };
  const handleCancelLeave = () => {
    setIsModalOpen(false);
  };

  // 채팅방 클릭 시
  const handleChatRoomClick = (chatRoomId: number) => {
    // 목록 스크롤 위치를 저장
    if (chatListRef.current) {
      sessionStorage.setItem(
        "scrollPosition",
        chatListRef.current.scrollTop.toString(),
      );
    }
    // slug 기반으로 이동
    router.push(`/chat/${chatRoomId}`);
  };

  // 목록 스크롤 복원
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (chatListRef.current && savedPosition) {
      chatListRef.current.scrollTop = parseInt(savedPosition, 10);
    }
  }, [data]);

  // 새로운 메시지가 생기거나 채팅방에 들어갈 때 자동 스크롤 하단
  const scrollToBottom = () => {
    if (chatRoomRef.current) {
      chatRoomRef.current.scrollTop = chatRoomRef.current.scrollHeight;
    }
  };

  // 과거 메시지 불러오기
  useEffect(() => {
    if (chatRoomDetailsData) {
      setPastMessages((prev) => ({
        ...prev,
        [selectedChatRoom!]: chatRoomDetailsData.messages || [],
      }));
      scrollToBottom();
    }
  }, [chatRoomDetailsData, selectedChatRoom]);

  // 새 메시지 있을 때 스크롤 하단
  useEffect(() => {
    if (newMessages[selectedChatRoom!]?.length > 0) {
      scrollToBottom();
    }
  }, [newMessages, selectedChatRoom]);

  // 소켓 연결
  useEffect(() => {
    socketRef.current = io("https://meetingsquare.site");
    // socketRef.current = io("http://localhost:8000"); // 로컬 테스트용
    const handleConnect = () => {
      console.log("Connected to Socket.IO server");
    };

    const handleDisconnect = () => {
      console.log("Disconnected from Socket.IO server");
    };

    const handleBroadcastMessage = (message: Message) => {
      const updatedMessage = {
        ...message,
        nickname: message.nickName,
      };
      setNewMessages((prevMessages: MessagesByChatRoom) => ({
        ...prevMessages,
        [message.chatRoomId]: [
          ...(prevMessages[message.chatRoomId] || []),
          updatedMessage,
        ],
      }));
    };

    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("broadcastMessage", handleBroadcastMessage);
    socketRef.current.on("disconnect", handleDisconnect);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect", handleConnect);
        socketRef.current.off("broadcastMessage", handleBroadcastMessage);
        socketRef.current.off("disconnect", handleDisconnect);
        socketRef.current.disconnect();
      }
    };
  }, []);

  // 메시지 전송
  const handleSendMessage = () => {
    if (selectedChatRoom && newMessage.trim() !== "") {
      mutation.mutate({ chatRoomId: selectedChatRoom, content: newMessage });
      console.log("전송:", newMessage);
      setNewMessage("");
    } else {
      console.error("Message is empty or chat room is not selected");
    }
  };

  // 엔터키 전송
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 에러 처리
  if (error) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <h1 className="text-xl font-semibold text-darkgray">
          로그인 후 이용가능합니다.
        </h1>
      </div>
    );
  }

  // 로딩 처리
  if (isLoading || !currentUserNickname) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          className="w-[100px] h-[100px]"
        />
      </div>
    );
  }

  // 현재 선택된 채팅방 제목
  const selectedChatRoomTitle = data?.chatRooms?.find(
    (room: ChatRoom) => room.board.boardId === selectedChatRoom,
  )?.board.title;

  return (
    <>
      {/** 
       * flex-col md:flex-row
       * - 모바일: 세로 배치(목록/채팅 전환) 
       * - 데스크톱: 가로 배치(동시 표시) 
       */}
      <div className="flex h-screen overflow-hidden flex-col md:flex-row">
        {/* 
          1) "목록" 영역
             - 모바일에서 "채팅방 선택됨"이면 숨김
             - 데스크톱에서는 항상 보임
        */}
        <div
          className={`
            flex flex-col
            bg-white xl:border-r border-lightgray
            xl:w-[62rem] lg:w-[40rem] lg:border-r md:w-[30rem] md:border-r
            overflow-auto
            ${selectedChatRoom ? "hidden md:flex" : "flex"} 
            /* 모바일에서 채팅방 선택 시 목록 숨김 */
          `}
          ref={chatListRef}
        >
          {/* 채팅 목록 상단 */}
          <div className="flex justify-between m-[1rem] md:px-[1rem] mt-[2rem]">
            <div className="flex items-center">
              <Image src={icons_chat} alt="채팅 아이콘" />
              <h1 className="text-[1.5rem] font-semibold ml-[0.5rem]">CHAT</h1>
            </div>
          </div>

          {/* 채팅방 목록 */}
          <ul className="flex flex-col mx-auto items-center">
            {data?.chatRooms?.map((chatRoom: ChatRoom) => (
              <li
                key={chatRoom.id}
                className={`mb-4 border ${
                  selectedChatRoom === chatRoom.id
                    ? "border-darkpink"
                    : "border-transparent"
                } rounded-3xl`}
              >
                <PostPreview
                  boardId={chatRoom.id}
                  title={chatRoom.board.title}
                  tag={[chatRoom.board.category]}
                  date={chatRoom.board.date}
                  currentPerson={chatRoom.board.currentPerson}
                  maxCapacity={chatRoom.board.maxCapacity}
                  locationName={chatRoom.board.location.locationName}
                  status={chatRoom.board.status}
                  onClick={() => handleChatRoomClick(chatRoom.id)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* 
          2) "채팅방" 영역
             - 모바일에서 선택되지 않았으면 숨김
             - 데스크톱에서는 항상 보임
        */}
        <div
          className={`
            w-full
            min-h-screen
            flex flex-col
            overflow-auto
            ${selectedChatRoom ? "flex" : "hidden md:flex"}
            /* 모바일에서 채팅방 선택 안 되면 숨김 */
          `}
          ref={chatRoomRef}
        >
          {selectedChatRoom ? (
            <>
              {/* 상단: 채팅방 타이틀 + 뒤로가기 / 나가기 버튼 */}
              <div className="flex justify-between m-[1rem] md:px-[1rem] mt-[2rem]">
                <div className="flex items-center">
                  {/* 모바일에서만 보이는 뒤로가기 버튼 (목록으로) */}
                  <button
                    onClick={handleChatButtonClick}
                    className="md:hidden mr-2"
                  >
                    <Image src={back} alt="뒤로" />
                  </button>

                  {/* 기존 채팅 아이콘 + 제목 */}
                  <Image src={icons_chat} alt="채팅 아이콘" />
                  <h1 className="text-[1.5rem] w-[18rem] md:w-[22rem] truncate font-semibold ml-[0.5rem]">
                    {selectedChatRoomTitle || "채팅방"}
                  </h1>
                </div>

                {/* 데스크톱에서 "뒤로가기" 대신 "나가기" 아이콘 */}
                <button onClick={handleLeaveChatRoom}>
                  <Image src={exit} alt="나가기" />
                </button>
              </div>

              <ConfirmModal
                isOpen={isModalOpen}
                onConfirm={handleConfirmLeave}
                onCancel={handleCancelLeave}
              />

              {/* 채팅 메시지 영역 */}
              <div className="flex-grow py-4 px-[1rem] md:px-[2rem] overflow-auto">
                {/* 과거 메시지 */}
                {(pastMessages[selectedChatRoom] || []).map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 flex ${
                      msg.nickname === currentUserNickname
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="flex flex-col">
                      {msg.nickname !== currentUserNickname && (
                        <span className="text-xs text-gray ml-1 mb-1">
                          {msg.nickname || "익명"}
                        </span>
                      )}
                      <div
                        className={`p-2 rounded-lg text-sm ${
                          msg.nickname === currentUserNickname
                            ? "bg-pink text-black"
                            : "bg-lightgray text-black"
                        }`}
                      >
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* 새 메시지 */}
                {(newMessages[selectedChatRoom] || []).map((msg, index) => (
                  <div
                  key={index}
                  className={`mb-2 flex ${
                    msg.nickname === currentUserNickname
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="flex flex-col">
                    {msg.nickname !== currentUserNickname && (
                      <span className="text-xs text-gray ml-1 mb-1">
                        {msg.nickname || "익명"}
                      </span>
                    )}
                    <div
                      className={`p-2 rounded-lg text-sm ${
                        msg.nickname === currentUserNickname
                          ? "bg-pink text-black"
                          : "bg-lightgray text-black"
                      }`}
                    >
                      <span>{msg.content}</span>
                    </div>
                  </div>
                </div>
                ))}
              </div>

              {/* 메시지 입력창 */}
              <div className="input_container flex items-center justify-center px-[1rem] md:px-[2rem] py-[1rem] mb-16 md:mb-0">
                <input
                  type="text"
                  className="h-[3rem] mr-[1rem] border border-lightgray rounded-lg px-4 w-full"
                  placeholder="메시지를 입력하세요..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="w-[6rem] h-[3rem] bg-darkpink rounded-lg text-white"
                  onClick={handleSendMessage}
                >
                  전송
                </button>
              </div>
            </>
          ) : (
            // 데스크톱에서는 동시에 보여주므로, 사실상 여기 오지 않음
            // 모바일에서만 "선택 안 된 상태"면 숨김
            <div className="flex-grow flex items-center justify-center">
              <h1 className="text-[1.5rem] font-semibold">채팅방을 선택하세요</h1>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
