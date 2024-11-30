import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const TaxiPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  width: 100%; 
  margin-top: 10px;
`;

const Input = styled.input`
  width: 90%;
  max-width: 400px; 
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  margin-top: 5px;
`;

const Button = styled.button`
  width: 70%;
  max-width: 400px; 
  margin-left: 30px;
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #2563eb;
  }
`;

const ResponseContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.25rem;
  background-color: ${(props) => (props.success ? "#ecfdf5" : "#fef2f2")};
  color: ${(props) => (props.success ? "#065f46" : "#991b1b")};
`;

const ErrorContainer = styled.div`
  background-color: #fef2f2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-top: 1rem;
`;

const API_BASE_URL = "http://localhost:8000"; // NestJS 서버 주소

const TaxiPage = () => {
  const navigate = useNavigate();
  const { direction } = useOutletContext();

  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem("userId");
    return savedUserId || "";
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [redirectTimer, setRedirectTimer] = useState(null);

  const isUserLoggedIn = () => {
    const userId = localStorage.getItem("userId");
    return !!userId; // 로그인 상태를 반환
  };

  const resetState = () => {
    setUserId("");
    setResponse(null);
    setCurrentGroupId(null);
  };

  useEffect(() => {
    // userId가 변경될 때마다 localStorage 업데이트
    if (userId) {
      localStorage.setItem("userId", userId);
    }
  }, [userId]);

  useEffect(() => {
    let statusCheckInterval = null;

    const checkGroupStatus = async () => {
      if (!currentGroupId) return;

      try {
        const url = `${API_BASE_URL}/taxi/group/${currentGroupId}`;
        console.log("Polling group status:", url);

        const { data } = await axios.get(url);

        if (data.success) {
          setResponse((prev) => ({
            ...prev,
            data: {
              ...prev.data,
              group: {
                ...prev.data.group,
                memberCount: data.memberCount,
                isFull: data.isFull,
              },
            },
            message: `${prev.message.split("|")[0]} | 그룹 번호: ${
              data.groupId
            } (${data.memberCount}/4명)`,
          }));

          if (data.isFull && !redirectTimer) {
            setResponse((prev) => ({
              ...prev,
              message: `${prev.message} | 3초 후 채팅방으로 이동합니다...`,
            }));

            const timer = setTimeout(() => {
              navigate(`/chat/room/${currentGroupId}`);
            }, 3000);

            setRedirectTimer(timer);
          }
        }
      } catch (err) {
        console.error("그룹 상태 확인 중 오류:", err.response || err);
      }
    };

    if (currentGroupId) {
      statusCheckInterval = setInterval(checkGroupStatus, 3000);
      checkGroupStatus();
    }

    return () => {
      if (statusCheckInterval) clearInterval(statusCheckInterval);
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [currentGroupId, navigate, redirectTimer]);

  const handleSubmit = async () => {
    if (!isUserLoggedIn()){
      navigate("/login"); // 로그인 화면으로 이동
      return;
    } 

    if (!userId.trim()) {
      setError("사용자 ID를 입력해주세요.");
      return;
    } 
  
      try {
        const userId = localStorage.getItem("userId");
        const locationData = {
          userId,
          to: direction === "giheung-to-mju" ? "mju" : "gh",
        };
  
        console.log("위치 데이터 전송:", locationData);
        console.log("요청 URL:", `${API_BASE_URL}/taxi/location`);
  
        const { data } = await axios.post(
          `${API_BASE_URL}/taxi/location`,
          locationData
        );
        console.log("서버 응답:", data);
  
        //localStorage.setItem("userId", userId);
  
        setResponse(data);
  
        if (data.success && data.data.group) {
          setCurrentGroupId(data.data.group.groupId);
  
          if (data.data.group.isFull && !redirectTimer) {
            setResponse((prev) => ({
              ...prev,
              message: `${prev.message} | 3초 후 채팅방으로 이동합니다...`,
            }));
  
            const timer = setTimeout(() => {
              navigate(`/chat/room/${data.data.group.groupId}`);
            }, 3000);
  
            setRedirectTimer(timer);
          }
        }
      } catch (err) {
        console.error("API 요청 상세 오류:", {
          status: err.response?.status,
          data: err.response?.data,
          config: err.config,
        });
        setError(
          "서버 요청 중 오류가 발생했습니다: " +
            (err.response?.data?.message || err.message)
        );
    }
  };

  return (
    <TaxiPageContainer>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">사용자 ID:</label>
          <Input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="사용자 ID를 입력하세요"
          />
        </div>

        <Button onClick={handleSubmit}>택시 모집</Button>

        {error && <ErrorContainer>{error}</ErrorContainer>}

        {response && (
          <ResponseContainer success={response.success}>
            <p>{response.message}</p>
            {response.data?.group && (
              <p className="mt-2">
                현재 인원: {response.data.group.memberCount}/4
                {response.data.group.isFull && " (모집 완료)"}
              </p>
            )}
          </ResponseContainer>
        )}
      </div>
    </TaxiPageContainer>
  );
};

export default TaxiPage;
