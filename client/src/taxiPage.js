import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const TaxiPageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
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

const LocationInfo = styled.div`
  background-color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
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

const DirectionInfo = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 1rem;
  text-align: center;
`;

// API 기본 URL 설정
const API_BASE_URL = "http://localhost:8000"; // NestJS 서버 주소

const TaxiPage = () => {
  const { direction } = useOutletContext();
  const [userId, setUserId] = useState("");
  const [latitude, setLatitude] = useState("-");
  const [longitude, setLongitude] = useState("-");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [currentGroupId, setCurrentGroupId] = useState(null);

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setError("");
        },
        (error) => {
          setError("위치 정보를 가져올 수 없습니다: " + error.message);
        }
      );
    } else {
      setError("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  }, []);

  // 그룹 상태 주기적 확인
  useEffect(() => {
    let intervalId;

    if (currentGroupId) {
      intervalId = setInterval(async () => {
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
          }
        } catch (err) {
          console.error("그룹 상태 확인 중 오류:", err.response || err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentGroupId]);

  const handleSubmit = async () => {
    if (!userId) {
      setError("사용자 ID를 입력해주세요.");
      return;
    }

    if (latitude === "-" || longitude === "-") {
      setError("위치 정보를 가져올 수 없습니다.");
      return;
    }

    try {
      const locationData = {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        to: direction === "giheung-to-mju" ? "mju" : "gh",
      };

      console.log("위치 데이터 전송:", locationData);
      console.log("요청 URL:", `${API_BASE_URL}/taxi/location`);

      const { data } = await axios.post(
        `${API_BASE_URL}/taxi/location`,
        locationData
      );
      console.log("서버 응답:", data);

      setResponse(data);

      if (data.success && data.data.group) {
        setCurrentGroupId(data.data.group.groupId);
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

        <LocationInfo>
          <div className="mb-2">위도: {latitude}</div>
          <div>경도: {longitude}</div>
        </LocationInfo>

        <Button onClick={handleSubmit}>위치 전송하기</Button>

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
