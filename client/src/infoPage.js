import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext } from "react-router-dom";

const ScrollContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  padding: 0 40px;
`;

const CardViewport = styled.div`
  width: 100%;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: ${(props) => (props.type === 'shuttle' ? '6px solid #001C4A' : '6px solid #C00305')};
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

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const LeftScrollButton = styled(ScrollButton)`
  left: 0;
`;

const RightScrollButton = styled(ScrollButton)`
  right: 0;
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
    "셔틀": 20, "5600": 32, "5005": 38,
    "5003A": 43, "5003B": 43, "820": 44
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

  const fetchBusInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/bus/${direction}`);
      if (!response.ok) throw new Error('네트워크 오류입니다.');
      const data = await response.json();
      const filteredBusInfo = data.map((bus) => {
        const departureMinutes = bus.도착시간 ? parseInt(bus.도착시간) : 0;
        const departureTime = calculateTime(departureMinutes);
        const arrivalTime = calculateArrivalTime(departureMinutes, bus.버스번호);
        return {
          busNumber: bus.버스번호,
          departureTime,
          arrivalTime,
          remainingSeats: bus.남은좌석수 || '정보 없음',
          type: 'bus',
        };
      });
      setBusInfo(filteredBusInfo);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchShuttleInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/shuttle/next`);
      if (!response.ok) throw new Error('운행 종료');
      const data = await response.json();
      if (!data?.time) throw new Error('운행 종료');
      
      setShuttleInfo([{
        busNumber: data.nextShuttle || '셔틀',
        departureTime: calculateTime(parseInt(data.time)),
        arrivalTime: calculateArrivalTime(parseInt(data.time), "셔틀"),
        remainingSeats: '정보 없음',
        type: 'shuttle'
      }]);
    } catch (error) {
      setShuttleInfo([{
        busNumber: "셔틀",
        departureTime: "운행 종료",
        arrivalTime: '운행 종료',
        remainingSeats: '-',
        type: 'shuttle'
      }]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setCurrentIndex(0);
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

  const handleRefresh = () => {
    fetchData();
  };

  const sortedInfo = [...busInfo, ...shuttleInfo].sort((a, b) => {
    if (a.departureTime === '운행 종료') return 1;
    if (b.departureTime === '운행 종료') return -1;
    
    const [aHours, aMinutes] = a.departureTime.split(':').map(Number);
    const [bHours, bMinutes] = b.departureTime.split(':').map(Number);
    
    if (aHours !== bHours) return aHours - bHours;
    return aMinutes - bMinutes;
  });

  const scroll = (direction) => {
    if (direction === 'left' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'right' && currentIndex < sortedInfo.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) return <LoadingOrError>로딩 중...</LoadingOrError>;
  if (error) return <LoadingOrError>오류: {error}</LoadingOrError>;

  return (
    <ScrollContainer>
      <LeftScrollButton 
        onClick={() => scroll('left')} 
        disabled={currentIndex === 0}
      >
        ←
      </LeftScrollButton>
      <CardViewport>
        <CardContainer>
          {sortedInfo
            .slice(currentIndex, currentIndex + 3)
            .map((info, index) => (
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
      <RightScrollButton 
        onClick={() => scroll('right')} 
        disabled={currentIndex >= sortedInfo.length - 3}
      >
        →
      </RightScrollButton>
      <RefreshButton onClick={handleRefresh}>↺</RefreshButton>
    </ScrollContainer>
  );
};

export default Info;