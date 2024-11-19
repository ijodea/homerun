import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext } from "react-router-dom";

const ScrollContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  padding: 0 40px;
  box-sizing: border-box;
`;

const CardViewport = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const CardContainer = styled.div`
  display: flex;
  gap: 20px;
  width: fit-content;
  will-change: transform;
  transform: translateX(${props => props.offset}px);
  transition: ${props => props.isDragging ? 'none' : 'transform 0.3s ease-out'};
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: ${(props) =>
    props.type === "shuttle" ? "6px solid #001C4A" : "6px solid #C00305"};
  width: calc((100vw - 140px) / 3);
  max-width: 360px;
  box-sizing: border-box;
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
  background-color: #005700;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    background-color: #003e00;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);

  const cardWidth = window.innerWidth > 1200 ? 400 : window.innerWidth / 3;

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);
    setPrevTranslate(currentTranslate);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;
    const newTranslate = prevTranslate + diff;
    
    const maxTranslate = 0;
    const minTranslate = -(sortedInfo.length - 3) * (cardWidth + 20);
    
    if (newTranslate > maxTranslate) {
      setCurrentTranslate(maxTranslate);
    } else if (newTranslate < minTranslate) {
      setCurrentTranslate(minTranslate);
    } else {
      setCurrentTranslate(newTranslate);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const moveThreshold = cardWidth / 4;
    const diff = currentTranslate - prevTranslate;
    
    let snapPosition;
    if (Math.abs(diff) > moveThreshold) {
      if (diff > 0) {
        snapPosition = Math.ceil(currentTranslate / (cardWidth + 20)) * (cardWidth + 20);
      } else {
        snapPosition = Math.floor(currentTranslate / (cardWidth + 20)) * (cardWidth + 20);
      }
    } else {
      snapPosition = Math.round(currentTranslate / (cardWidth + 20)) * (cardWidth + 20);
    }
    
    setCurrentTranslate(snapPosition);
    setCurrentIndex(Math.abs(Math.round(snapPosition / (cardWidth + 20))));
  };

  const fetchBusInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/bus/${direction}`);
      if (!response.ok) throw new Error("네트워크 오류입니다.");
      const data = await response.json();
      const filteredBusInfo = data.map((bus) => {
        const departureMinutes = bus.도착시간 ? parseInt(bus.도착시간) : 0;
        const departureTime = calculateTime(departureMinutes);
        const arrivalTime = calculateArrivalTime(departureMinutes, bus.버스번호);
        return {
          busNumber: bus.버스번호,
          departureTime,
          arrivalTime,
          remainingSeats: bus.남은좌석수 || "정보 없음",
          type: "bus",
        };
      });
      setBusInfo(filteredBusInfo);
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

      setShuttleInfo([
        {
          busNumber: data.nextShuttle || "셔틀",
          departureTime: calculateTime(parseInt(data.time)),
          arrivalTime: calculateArrivalTime(parseInt(data.time), "셔틀"),
          remainingSeats: "정보 없음",
          type: "shuttle",
        },
      ]);
    } catch (error) {
      setShuttleInfo([
        {
          busNumber: "셔틀",
          departureTime: "운행 종료",
          arrivalTime: "운행 종료",
          remainingSeats: "-",
          type: "shuttle",
        },
      ]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setCurrentTranslate(0);
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

  useEffect(() => {
    const handleResize = () => {
      const newCardWidth = window.innerWidth > 1200 ? 400 : window.innerWidth / 3;
      const newTranslate = currentIndex * -(newCardWidth + 20);
      setCurrentTranslate(newTranslate);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  const handleRefresh = () => {
    fetchData();
  };

  const sortedInfo = [...busInfo, ...shuttleInfo].sort((a, b) => {
    if (a.departureTime === "운행 종료") return 1;
    if (b.departureTime === "운행 종료") return -1;

    const [aHours, aMinutes] = a.departureTime.split(":").map(Number);
    const [bHours, bMinutes] = b.departureTime.split(":").map(Number);

    if (aHours !== bHours) return aHours - bHours;
    return aMinutes - bMinutes;
  });

  if (loading) return <LoadingOrError>로딩 중...</LoadingOrError>;
  if (error) return <LoadingOrError>오류: {error}</LoadingOrError>;

  return (
    <ScrollContainer>
      <CardViewport
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <CardContainer
          totalCards={sortedInfo.length}
          offset={currentTranslate}
          isDragging={isDragging}
        >
          {sortedInfo.map((info, index) => (
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
      <RefreshButton onClick={handleRefresh}>↺</RefreshButton>
    </ScrollContainer>
  );
};

export default Info;