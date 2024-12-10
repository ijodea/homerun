import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import io from "socket.io-client";

const SERVER_URL = "http://localhost:8000";

// Styled Components
const ChatContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

const Header = styled.div`
  background-color: white;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 48rem;
  margin: 0 auto;
`;

const BackButton = styled.button`
  padding: 0.5rem;
  border-radius: 9999px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #4b5563;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const GroupInfo = styled.div`
  flex: 1;
`;

const GroupTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
`;

const MemberCount = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OnlineDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  background-color: #10b981;
  border-radius: 9999px;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const MessagesContainer = styled.div`
  max-width: 48rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${(props) =>
    props.isMyMessage ? "flex-end" : "flex-start"};
  margin-bottom: 1rem;
`;

const MessageContent = styled.div`
  max-width: 70%;
`;

const SenderName = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.75rem;
  margin-bottom: 0.25rem;
  display: block;
`;

const MessageBubble = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  ${(props) =>
    props.isMyMessage
      ? `
    background-color: #2563eb;
    color: white;
    border-bottom-right-radius: 0.25rem;
  `
      : `
    background-color: white;
    color: #1f2937;
    border-bottom-left-radius: 0.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  `}
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  display: block;
  text-align: ${(props) => (props.isMyMessage ? "right" : "left")};
  padding: 0 0.5rem;
`;

const InputArea = styled.div`
  background-color: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
`;

const InputForm = styled.form`
  max-width: 48rem;
  margin: 0 auto;
  display: flex;
  gap: 0.75rem;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  outline: none;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: none;
  background-color: ${(props) => (props.disabled ? "#e5e7eb" : "#2563eb")};
  color: ${(props) => (props.disabled ? "#9ca3af" : "white")};
  font-weight: 500;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }
`;

function ChatRoom() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const socketRef = useRef(null);

  const getUserData = () => {
    const kakaoUser = JSON.parse(localStorage.getItem("kakaoUser"));
    const normalUser = JSON.parse(localStorage.getItem("user"));
    return kakaoUser || normalUser;
  };

  const userData = getUserData();

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
  }, [userData, navigate]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeRoom = async () => {
      if (!groupId || !userData) return;

      try {
        console.log(`Attempting to create chat room for groupId: ${groupId}`);
        const createResponse = await axios.post(
          `${SERVER_URL}/chat/room/${groupId}`
        );

        console.log("Create chat room response:", createResponse.data);

        if (createResponse.data.success) {
          setRoomInfo(createResponse.data.data);
          setMessages(createResponse.data.data.messages);
        } else {
          console.log(
            `Chat room creation failed, trying to get existing room for groupId: ${groupId}`
          );
          const getResponse = await axios.get(
            `${SERVER_URL}/chat/room/${groupId}`
          );

          console.log("Get chat room response:", getResponse.data);

          if (getResponse.data.success) {
            setRoomInfo(getResponse.data.data);
            setMessages(getResponse.data.data.messages);
          } else {
            console.error(
              "Failed to retrieve chat room:",
              getResponse.data.message
            );
            setError(getResponse.data.message || "채팅방을 불러올 수 없습니다");
          }
        }
      } catch (err) {
        console.error("채팅방 초기화 오류:", err);
        setError("서버 연결에 실패했습니다");
      }
    };

    initializeRoom();

    socketRef.current = io(SERVER_URL, {
      query: { groupId },
    });

    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [groupId, userData]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userData) return;

    try {
      await axios.post(`${SERVER_URL}/chat/message`, {
        groupId,
        userId: userData.nickname,
        content: newMessage,
      });
      setNewMessage("");
    } catch (err) {
      console.error("메시지 전송 오류:", err);
      setError("메시지 전송 중 오류가 발생했습니다");
    }
  };

  const handleBack = () => {
    navigate("/taxi");
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 bg-white p-4 rounded-lg shadow">
          {error}
        </div>
      </div>
    );
  }

  return (
    <ChatContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>←</BackButton>
          <GroupInfo>
            <GroupTitle>Group #{groupId}</GroupTitle>
            <MemberCount>
              <OnlineDot />
              {roomInfo?.members?.length || 0} members active
            </MemberCount>
          </GroupInfo>
        </HeaderContent>
      </Header>

      <ChatArea ref={messageContainerRef}>
        <MessagesContainer>
          {messages.map((message) => {
            // 현재 사용자의 ID와 메시지 작성자의 ID를 비교
            const isMyMessage = message.userId === userData?.nickname;

            return (
              <MessageWrapper key={message.id} isMyMessage={isMyMessage}>
                <MessageContent>
                  {!isMyMessage && <SenderName>{message.userId}</SenderName>}
                  <MessageBubble isMyMessage={isMyMessage}>
                    {message.content}
                  </MessageBubble>
                  <MessageTime isMyMessage={isMyMessage}>
                    {formatTime(message.createAt)}
                  </MessageTime>
                </MessageContent>
              </MessageWrapper>
            );
          })}
          <div ref={messagesEndRef} />
        </MessagesContainer>
      </ChatArea>

      <InputArea>
        <InputForm onSubmit={handleSendMessage}>
          <MessageInput
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
          />
          <SendButton type="submit" disabled={!newMessage.trim()}>
            전송
          </SendButton>
        </InputForm>
      </InputArea>
    </ChatContainer>
  );
}

export default ChatRoom;
