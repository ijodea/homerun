// ChatRoom.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

function ChatRoom() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem("userId"); // 이전 페이지에서 저장한 userId 사용

  // localStorage에 userId가 없는 경우 taxi 페이지로 리다이렉트
  useEffect(() => {
    if (!userId) {
      navigate("/taxi");
    }
  }, [userId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 채팅방 생성 또는 참여
  useEffect(() => {
    const initializeRoom = async () => {
      if (!groupId) return;

      try {
        // 먼저 채팅방 생성 시도
        const createResponse = await axios.post(
          `${API_BASE_URL}/chat/room/${groupId}`
        );

        if (createResponse.data.success) {
          setRoomInfo(createResponse.data.data);
          setMessages(createResponse.data.data.messages);
        } else {
          // 생성 실패 시 기존 채팅방 조회
          const getResponse = await axios.get(
            `${API_BASE_URL}/chat/room/${groupId}`
          );

          if (getResponse.data.success) {
            setRoomInfo(getResponse.data.data);
            setMessages(getResponse.data.data.messages);
          } else {
            setError(getResponse.data.message || "채팅방을 불러올 수 없습니다");
          }
        }
      } catch (err) {
        console.error("채팅방 초기화 오류:", err);
        setError("서버 연결에 실패했습니다");
      }
    };

    initializeRoom();

    // 주기적으로 메시지 업데이트 (폴링)
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/chat/room/${groupId}`
        );

        if (response.data.success) {
          setMessages(response.data.data.messages);
        }
      } catch (err) {
        console.error("메시지 업데이트 오류:", err);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/message`, {
        groupId,
        userId,
        content: newMessage,
      });

      if (response.data.success) {
        setNewMessage("");
      } else {
        setError("메시지 전송에 실패했습니다");
      }
    } catch (err) {
      console.error("메시지 전송 오류:", err);
      setError("메시지 전송 중 오류가 발생했습니다");
    }
  };

  const handleBack = () => {
    navigate("/taxi");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <div className="ml-4">
          <h1 className="text-lg font-semibold">택시 그룹 {groupId}</h1>
          <p className="text-sm text-gray-500">
            {roomInfo?.members?.length || 0}명의 멤버
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.userId === userId ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.userId === userId
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
            >
              {message.userId !== userId && (
                <div className="text-xs text-gray-500 mb-1">
                  {message.userId}
                </div>
              )}
              <div>{message.content}</div>
              <div className="text-xs mt-1 text-right">
                {new Date(message.createAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white p-4 flex items-center gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none"
          disabled={!newMessage.trim()}
        >
          →
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
