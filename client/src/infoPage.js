import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext } from "react-router-dom";

const ScrollContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 20px;
  position: relative;
  padding: 0 40px 10px;
  box-sizing: border-box;
  @media (max-width: 768px) {
    padding-bottom: 5px;
    margin-bottom: 5px;
  }
`;

const CardViewport = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 10px;
  height: 400px;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px;
  border: 1px solid #ccc;
  @media (max-width: 768px) {
    margin-bottom: 5px;
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: ${(props) =>
    props.type === "shuttle" ? "6px solid #001C4A" : "6px solid #C00305"};
  width: calc(50% - 15px);
  box-sizing: border-box;
  cursor: pointer;
  @media (max-width: 768px) {
    width: 100%;
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
    margin-bottom: 60px;
  }
`;

const LoadingOrError = styled.div`
  text-align: center;
  font-size: 18px;
  margin-top: 20px;
`;

const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border: 4px solid #001C4A;
  width: 300px;
  text-align: center;
`;

const PopupButton = styled.button`
  background-color: #001C4A;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
  margin-right: 10px;
`;

const CancelButton = styled(PopupButton)`
  background-color: #C00305;
`;

const PopupContent = ({ onConfirm, onCancel }) => (
  <Popup>
    <h3>셔틀을 탑승하셨습니까?</h3>
    <p>올바른 정보 제공은 정보 개선에 도움을 줍니다.</p>
    <div>
      <PopupButton onClick={onConfirm}>확인</PopupButton>
      <CancelButton onClick={onCancel}>취소</CancelButton>
    </div>
  </Popup>
);

const ThankYouPopup = ({ onClose }) => (
  <Popup>
    <h3>정보를 제공해주셔서 감사합니다!</h3>
    <PopupButton onClick={onClose}>닫기</PopupButton>
  </Popup>
);

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
  const [showPopup, setShowPopup] = useState(false);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  const fetchBusInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/bus/${direction}`);
      if (!response.ok) throw new Error("네트워크 오류입니다.");
      const data = await response.json();
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
        setBusInfo([]);
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

  const handleCardClick = (info) => {
    if (info.type === "shuttle") {
      setSelectedBus(info);
      setShowPopup(true);
    }
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    setShowThankYouPopup(true);
  };

  const handlePopupCancel = () => {
    setShowPopup(false);
  };

  const handleThankYouClose = () => {
    setShowThankYouPopup(false);
  };

  if (loading) return <LoadingOrError>로딩 중...</LoadingOrError>;
  if (error) return <LoadingOrError>오류: {error}</LoadingOrError>;

  const sortedInfo = [...busInfo, ...shuttleInfo].sort((a, b) => {
    if (a.arrivalTime === "운행 종료") return 1;
    if (b.arrivalTime === "운행 종료") return -1;
    const [aHours, aMinutes] = a.arrivalTime.split(":").map(Number);
    const [bHours, bMinutes] = b.arrivalTime.split(":").map(Number);
    return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
  });

  return (
    <ScrollContainer>
      <CardViewport>
        <CardContainer>
          {sortedInfo.map((info, index) => (
            <Card key={index} onClick={() => handleCardClick(info)} type={info.type}>
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
      <RefreshButton onClick={fetchData}>↺</RefreshButton>
      {showPopup && <PopupContent onConfirm={handlePopupConfirm} onCancel={handlePopupCancel} />}
      {showThankYouPopup && <ThankYouPopup onClose={handleThankYouClose} />}
    </ScrollContainer>
  );
};

export default Info;