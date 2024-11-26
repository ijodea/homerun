import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext } from "react-router-dom";

const ScrollContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  padding: 0 40px 10px; /* 하단 여백 줄이기 */
  margin-bottom: 20px;
  box-sizing: border-box;

    /* 모바일 화면에서 하단 여백 조정 */
    @media (max-width: 768px) {
    padding-bottom: 5px; 
    margin-bottom: 5px;
  }
`;

const CardViewport = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  height: 400px; 
  overflow-y: auto; /* 카드 영역만 수직 스크롤 가능 */
  box-sizing: border-box;
  padding: 20px;
  border: 1px solid #ccc; 
  margin-bottom: 10px; 

    /* 모바일 화면에서 하단 여백 조정 */
    @media (max-width: 768px) {
    margin-bottom: 5px; /* 간격 줄이기 */
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px; 
  
  @media (max-width: 768px) {
    flex-direction: column; /* 모바일에서는 세로 정렬 */
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: ${(props) =>
    props.type === "shuttle" ? "6px solid #001C4A" : "6px solid #C00305"};
  width: calc(50% - 15px); /* 한 줄에 카드 2개, 간격을 고려하여 너비 계산 */
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%; /* 모바일에서는 전체 너비 사용 */
  }
`;

const TopInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const BusNumber = styled.div`
  font-size: 28px;
  font-weight: bold;
`;

const SeatInfo = styled.div`
  color: #0066ff;
  font-size: 16px;
`;

const TimeBlock = styled.div`
  text-align: center;
  flex-shrink: 0;
  min-width: 80px;

  div:first-child {
    color: #666;
    font-size: 14px;
    margin-bottom: 5px;
  }

  div:last-child {
    font-size: 18px;
    font-weight: bold;
  }
`;

const DottedLine = styled.div`
  flex-grow: 1;
  border-bottom: 2px dashed #ccc;
  margin: 0 15px;
  height: 1px;
  align-self: center;
`;

const LineContainer = styled.div`
  display: flex;
  align-items: center;
`;

const RefreshButton = styled.button`
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 50px;
  height: 50px;
  font-size: 1.5em;
  margin-bottom: 15px;
  background-color: #005700;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    background-color: #003e00;
  }

  @media (max-width: 768px) {
            margin-bottom : 60px; /* 모바일 화면에서 이미지 숨기기 */
        }
`;

const LoadingOrError = styled.div`
  text-align: center;
  font-size: 18px;
  margin-top: 20px;
`;

const calculateTime = (minutesFromNow) => {
  const time = new Date(Date.now() + minutesFromNow * 60000);
  return time.toTimeString().slice(0, 5);
};

const calculateArrivalTime = (departureMinutes, busNumber) => {
  const busTimes = {
    셔틀: 20,
    5600: 32,
    5005: 38,
    "5003A": 43,
    "5003B": 43,
    820: 44,
  };
  return calculateTime(departureMinutes + (busTimes[busNumber] || 0));
};

const Info = () => {
  const [busInfo, setBusInfo] = useState([]);
  const [shuttleInfo, setShuttleInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { direction } = useOutletContext();

  const fetchBusInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/bus/${direction}`);
      if (!response.ok) throw new Error("네트워크 오류입니다.");
      const data = await response.json();
      // 데이터가 배열인지 확인
      if (Array.isArray(data)) {
        const filteredBusInfo = data.map((bus) => {
          const departureMinutes = bus.도착시간 ? parseInt(bus.도착시간) : 0;
          const departureTime = calculateTime(departureMinutes);
          const arrivalTime = calculateArrivalTime(departureMinutes, bus.버스번호);
          return {
            busNumber: bus.버스번호,
            departureTime,
            arrivalTime,
            remainingSeats: direction === "mju-to-giheung" ? "공석" : bus.남은좌석수,
            type: "bus",
          };
        });
        setBusInfo(filteredBusInfo);
      } else {
        setBusInfo([]); // 배열이 아닌 경우 빈 배열로 설정
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchShuttleInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/shuttle/${direction}`);
      if (!response.ok) throw new Error("운행 종료");
      const data = await response.json();
      if (!data?.time) throw new Error("운행 종료");
      
      setShuttleInfo([{
        busNumber: data.nextShuttle || "셔틀",
        departureTime: calculateTime(parseInt(data.time)),
        arrivalTime: calculateArrivalTime(parseInt(data.time), "셔틀"),
        remainingSeats: "탑승 가능",
        type: "shuttle",
      }]);
    } catch (error) {
      setShuttleInfo([{
        busNumber: "셔틀",
        departureTime: "운행 종료",
        arrivalTime: "운행 종료", 
        remainingSeats: "-",
        type: "shuttle",
      }]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchBusInfo(), fetchShuttleInfo()]);
    } catch (error) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [direction]);

  if (loading) return <LoadingOrError>로딩 중...</LoadingOrError>;
  if (error) return <LoadingOrError>오류: {error}</LoadingOrError>;

  const sortedInfo = [...busInfo, ...shuttleInfo].sort((a, b) => {
    if (a.arrivalTime === "운행 종료") return 1;
    if (b.arrivalTime === "운행 종료") return -1;
    const [aHours, aMinutes] = a.arrivalTime.split(":").map(Number);
    const [bHours, bMinutes] = b.arrivalTime.split(":").map(Number);
    const aTotal = aHours * 60 + aMinutes;
    const bTotal = bHours * 60 + bMinutes;
    return aTotal - bTotal;
  });

  return (
    <ScrollContainer>
      <CardViewport>
        <CardContainer>
          {sortedInfo && sortedInfo.map((info, index) => (
            <Card key={index} type={info.type}>
              <TopInfo>
                <BusNumber>{info.busNumber}</BusNumber>
                <SeatInfo>{info.remainingSeats}</SeatInfo>
              </TopInfo>
              <LineContainer>
                <TimeBlock>
                  <div>출발</div>
                  <div>{info.departureTime}</div>
                </TimeBlock>
                <DottedLine />
                <TimeBlock>
                  <div>도착</div>
                  <div>{info.arrivalTime}</div>
                </TimeBlock>
              </LineContainer>
            </Card>
          ))}
        </CardContainer>
      </CardViewport>
      <RefreshButton onClick={fetchData}>🔄</RefreshButton>
    </ScrollContainer>
  );
};

export default Info;
