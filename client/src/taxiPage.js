import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import axios from "axios";
import io from "socket.io-client";

const SERVER_URL = "http://localhost:8000";

const TaxiPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
`;

const CardContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 90%;
  max-width: 400px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 auto;

  @media (max-width: 480px) {
    width: 85%;
    padding: 24px 20px;
    border-radius: 12px;
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;

  @media (max-width: 480px) {
    margin-top: 16px;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const pulseAnimation = css`
  ${pulse} 2s infinite
`;

const MatchButton = styled.button`
  background: ${(props) =>
    props.disabled
      ? "#e5e7eb"
      : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"};
  color: white;
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.disabled ? "none" : "0 4px 6px -1px rgba(59, 130, 246, 0.2)"};

  @media (max-width: 480px) {
    padding: 14px;
    font-size: 1rem;
    border-radius: 10px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  animation: ${(props) => (props.disabled ? "none" : pulseAnimation)};
`;

const loadingCircle = keyframes`
  0% {
    stroke-dashoffset: 180;
  }
  50% {
    stroke-dashoffset: 45;
    transform: rotate(135deg);
  }
  100% {
    stroke-dashoffset: 180;
    transform: rotate(450deg);
  }

`;

const LoadingWrapper = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  position: relative;

  svg {
    animation: ${loadingCircle} 2s linear infinite;
    width: 40px;
    height: 40px;
  }

  circle {
    fill: none;
    stroke: #3b82f6;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-dasharray: 180;
    transform-origin: center;
  }
`;

const LoadingText = styled.p`
  color: #4b5563;
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
`;

const StatusText = styled.p`
  color: #4b5563;
  font-size: 1rem;
  text-align: center;
  margin: 16px 0 0 0;
  line-height: 1.5;
`;

const ErrorContainer = styled.div`
  background-color: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const DirectionDisplay = styled.div`
  background-color: #f3f4f6;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
  font-size: 0.9rem;
  color: #4b5563;

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.85rem;
    margin-bottom: 16px;
  }
`;

const OnlineUsersDisplay = styled.div`
  background-color: #eef2ff;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 12px 0;
  text-align: center;
  width: 100%;
  font-size: 0.9rem;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.85rem;
    margin: 10px 0;
  }

  svg {
    width: 16px;
    height: 16px;
    fill: #4338ca;
  }
`;

const TaxiPage = () => {
  const navigate = useNavigate();
  const { direction } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [remainingTime, setRemainingTime] = useState(60);
  const [onlineUsers, setOnlineUsers] = useState({ mju: 0, gh: 0 });

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
    // WebSocket 연결 설정
    const socket = io(SERVER_URL, {
      query: {
        direction: direction === "giheung-to-mju" ? "mju" : "gh",
        userId: userData.id,
      },
    });

    // 온라인 사용자 수 업데이트 리스너
    socket.on("onlineUsers", (counts) => {
      setOnlineUsers(counts);
    });

    return () => {
      socket.disconnect();
    };
  }, [userData, direction, navigate]);

  useEffect(() => {
    let intervalId;
    if (isLoading) {
      setRemainingTime(60);
      intervalId = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setIsLoading(false);
            setError("매칭 시간이 초과되었습니다. 다시 시도해주세요.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  useEffect(() => {
    let statusCheckInterval = null;

    const checkGroupStatus = async () => {
      if (!currentGroupId) return;

      try {
        const { data } = await axios.get(
          `${SERVER_URL}/taxi/group/${currentGroupId}`
        );
        console.log("Group status response:", data);

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
            message: `매칭 진행 중... (${data.memberCount}/4명)`,
          }));

          if (data.isFull) {
            clearInterval(statusCheckInterval);
            setIsLoading(false);
            setTimeout(() => {
              console.log(
                `Navigating to chat room with groupId: ${currentGroupId}`
              );
              navigate(`/chat/room/${currentGroupId}`);
            }, 1000);
          }
        }
      } catch (err) {
        console.error("그룹 상태 확인 중 오류:", err);
        setError("그룹 상태 확인 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    if (currentGroupId && isLoading) {
      statusCheckInterval = setInterval(checkGroupStatus, 3000);
      checkGroupStatus();
    }

    return () => {
      if (statusCheckInterval) clearInterval(statusCheckInterval);
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [currentGroupId, navigate, searchTimeout, isLoading]);

  const handleSubmit = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const locationData = {
        userId: userData.nickname,
        to: direction === "giheung-to-mju" ? "mju" : "gh",
      };

      const { data } = await axios.post(
        `${SERVER_URL}/taxi/location`,
        locationData
      );

      if (data.success && data.data.group) {
        setResponse(data);
        setCurrentGroupId(data.data.group.groupId);

        const timeout = setTimeout(() => {
          setIsLoading(false);
          setError("매칭 시간이 초과되었습니다. 다시 시도해주세요.");
          setCurrentGroupId(null);
          setResponse(null);
        }, 60000);

        setSearchTimeout(timeout);
      }
    } catch (err) {
      console.error("API 요청 오류:", err);
      setError("매칭 요청 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const getDirectionText = () => {
    return direction === "giheung-to-mju"
      ? "기흥역 → 명지대"
      : "명지대 → 기흥역";
  };

  const getCurrentDirectionOnlineUsers = () => {
    return direction === "giheung-to-mju" ? onlineUsers.mju : onlineUsers.gh;
  };

  return (
    <TaxiPageContainer>
      <CardContainer>
        <DirectionDisplay>{getDirectionText()}</DirectionDisplay>

        <OnlineUsersDisplay>
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
          현재 {getCurrentDirectionOnlineUsers()}명이 이 방향을 검색중입니다
        </OnlineUsersDisplay>

        <ButtonContainer>
          <MatchButton onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "매칭 진행 중..." : "택시 매칭 시작하기"}
          </MatchButton>
        </ButtonContainer>

        {isLoading && (
          <LoadingWrapper>
            <LoadingSpinner>
              <svg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" />
              </svg>
            </LoadingSpinner>
            <LoadingText>매칭 진행 중... ({remainingTime}초)</LoadingText>
            {response?.data?.group && (
              <StatusText>
                현재 {response.data.group.memberCount}명이 매칭되었습니다
              </StatusText>
            )}
          </LoadingWrapper>
        )}

        {error && (
          <ErrorContainer>
            <span>⚠️</span>
            <span>{error}</span>
          </ErrorContainer>
        )}
      </CardContainer>
    </TaxiPageContainer>
  );
};

export default TaxiPage;
