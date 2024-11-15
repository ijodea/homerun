import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext } from "react-router-dom";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

// 스크롤 가능한 컨테이너 스타일 (세로 스크롤 활성화)
const ScrollContainer = styled.div`
  max-height: 400px; /* 필요에 따라 높이 조정 */
  overflow-y: auto; /* 세로 스크롤 활성화 */
  padding: 10px;
  
  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

// 카드 컨테이너 스타일 (가로 길이 유지)
const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* 가로 길이를 유지하면서 카드들이 줄바꿈되도록 설정 */
  justify-content: center;
`;

// 카드 스타일
const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin: 10px; /* 카드 간격 조정 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-basis: calc(45% - 20px); /* 가로 크기 유지 */
  max-width: 300px; /* 최대 가로 크기 고정 */
  
  color: black;
  
  // 버스 타입에 따른 테두리 색상 구분
  border: ${(props) => (props.type === 'shuttle' ? '6px solid #001C4A' : '6px solid #C00305')};
  
`;

// 상단 정보 스타일
const TopInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

const BusNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const SeatInfo = styled.div`
  color: #0066ff;
`;

const TimeBlock = styled.div`
  text-align: center;
`;

const DottedLine = styled.div`
  border-bottom: 2px dashed #ccc;
`;

const LineContainer = styled.div`
  display: flex;
`;

const RefreshButton = styled.button`
    width: 50px;
    height:50px;
    font-size:1.5em;
    background-color:#005700;
    color:white;
    border:none;
    border-radius:50%;
    cursor:pointer;

    &:hover {
      background-color:#003e00;
    }
`;

// 새로고침 버튼을 화면 오른쪽 하단에 고정
const ButtonContainer = styled.div`
    position: fixed;
    right: 20px; /* 화면 오른쪽 여백 */
    bottom: 20px; /* 화면 아래쪽 여백 */
`;

// 출발 시간 계산 함수
const calculateDepartureTime = (minutesFromNow) => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + minutesFromNow * 60000);
    const hours = futureTime.getHours().toString().padStart(2, '0');
    const minutes = futureTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// 도착 시간 계산 함수
const calculateArrivalTime = (departureMinutes, busNumber) => {
    const busTimes = {
        "셔틀": 20,
        "5600": 32,
        "5005": 38,
        "5003A": 43,
        "5003B": 43,
        "820": 44
    };
    const additionalTime = busTimes[busNumber] || 0;
    return calculateDepartureTime(departureMinutes + additionalTime);
};

// 버스 정보 가져오기 함수
const fetchBusInfo = async (direction, setBusInfo, setError, setLoading) => {
    try {
        const response = await fetch(`http://localhost:8000/bus/${direction}`);
        if (!response.ok) throw new Error('네트워크 오류입니다.');
        const data = await response.json();
        const filteredBusInfo = data.map((bus) => {
            const departureMinutes = bus.도착시간 ? parseInt(bus.도착시간) : 0;
            const departureTime = calculateDepartureTime(departureMinutes);
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
        setError("버스 정보를 불러오는 데 문제가 발생했습니다.");
    } finally {
        setLoading(false);
    }
};

// 셔틀 정보 가져오기 함수
const fetchShuttleInfo = async (setShuttleInfo, setError, setLoading) => {
    try {
        const response = await fetch(`http://localhost:8000/shuttle/next`);
        if (!response.ok) throw new Error('Error');
        const data = await response.json();
        const departureMinutes = parseInt(data.time);
        const departureTime = calculateDepartureTime(departureMinutes);
        const arrivalTime = calculateArrivalTime(departureMinutes, "셔틀");
        setShuttleInfo([{
            busNumber: data.nextShuttle ? `${data.nextShuttle}` : '셔틀',
            departureTime,
            arrivalTime,
            remainingSeats: '정보 없음',
            type: 'shuttle',
        }]);
    } catch (error) {
        console.error('Fetch error:', error);
        setShuttleInfo([{
            busNumber: "셔틀",
            departureTime: `${error.message}`,
            arrivalTime: 'Error',
            remainingSeats: 'Error',
            type: 'shuttle',
        }]);
    } finally {
        setLoading(false);
    }
};

// Info 컴포넌트 정의
const Info = () => {
    const [busInfo, setBusInfo] = useState([]);
    const [shuttleInfo, setShuttleInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { direction } = useOutletContext();

    // 컴포넌트가 처음 렌더링될 때 데이터 가져오기
    useEffect(() => {
        fetchBusInfo(direction, setBusInfo, setError, setLoading);
        fetchShuttleInfo(setShuttleInfo, setError, setLoading);
    }, [direction]);

    // 새로고침 버튼 핸들러
    const handleRefresh = () => {
        setLoading(true);
        fetchBusInfo(direction, setBusInfo, setError, setLoading);
        fetchShuttleInfo(setShuttleInfo, setError, setLoading);
    };

    // 버스 및 셔틀 정보를 도착 시간 기준으로 정렬
    const sortedInfo = [...busInfo, ...shuttleInfo].sort((a, b) => {
        const [aHours, aMinutes] = a.arrivalTime.split(':').map(Number);
        const [bHours, bMinutes] = b.arrivalTime.split(':').map(Number);
        return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            {/* 스크롤 가능한 컨테이너 */}
            <ScrollContainer>
                <CardContainer>
                    <TransitionGroup component={null}>
                        {sortedInfo.map((info, index) => (
                            <CSSTransition key={index} timeout={300} classNames="fade" appear={true}>
                                <Card type={info.type}>
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
                            </CSSTransition>
                        ))}
                    </TransitionGroup>
                </CardContainer>
            </ScrollContainer>

            {/* 새로고침 버튼 */}
            <ButtonContainer>
                <RefreshButton onClick={handleRefresh}>↺</RefreshButton>
            </ButtonContainer>
        </>
    );
};

export default Info;
