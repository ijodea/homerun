import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import DirectionControls from "./directioncontrols";
import taxiIcon from "./assets/Taxi.png";
import busInfoIcon from "./assets/Bus.png";
import "./App.css";

const AppContainer = styled.div`
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
`;  

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding-bottom: 60px;
  @media (min-width: 768px) {
    padding-bottom: 0;
  }
`;

const LoginLink = styled(Link)`
  color: black;
  font-size: 0.9em;
  text-decoration: none;
  position: absolute;
  right: 20px;
  top: 20px;
  &:hover {
    text-decoration: underline;
  }
`;

const LogoutButton = styled.button`
  color: black;
  font-size: 0.9em;
  background: none;
  border: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const HomerunLink = styled(Link)`
  color: #007bff;
  font-size: 1.5em;
  font-weight: bold;
  text-decoration: none;
  margin: 10px 20px;
`;

const MenuContainer = styled.nav`
  display: flex;
  justify-content: center;
  background-color: lightgray;
  padding: 10px 0;
  width: 100%;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.active ? "white" : "grey")};
  text-decoration: none;
  padding: 10px;
  font-size: 1.2em;
  margin: 0 5px;
  flex: 1;
  border-radius: 5px;
  font-size: clamp(1rem, 3vw, 1.5rem);
  background-color: ${(props) => 
    props.active ? (props.isinfo ? "#005700" : "#fb9403") : "transparent"};

  img {
    height: 40px;
    filter: ${(props) => (props.active ? "invert(1)" : "invert(0.5)")};
  }

  @media (max-width: 768px) {
    padding: 10px 5px;
    font-size: 1em;
  }

  &:hover {
    background-color: ${(props) =>
      props.active ? (props.isinfo ? "#005700" : "#fb9403") : "rgba(0, 0, 0, 0.1)"};
  }
`;

const TimeContainer = styled.div`
  background: white;
  padding: 15px 30px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border: 3px solid #007bff;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-around;
    max-width: 800px;
    margin: 20px auto;
  }
`;

const DirectionColumn = styled.div`
  width: 100%;
  margin-bottom: 20px;
  
  @media (min-width: 768px) {
    width: 45%;
    margin-bottom: 0;
  }
`;

const EfficientCardViewport = styled.div`
  width: 90%;
  max-width: 350px; // 300px에서 350px로 증가
  height: 200px; // 180px에서 200px로 증가
  overflow: hidden;
  position: relative;
  margin: 20px auto;
  touch-action: pan-y pinch-zoom;
`;

const EfficientCardContainer = styled.div`
  position: absolute;
  width: 100%;
  transition: ${props => props.isDragging ? 'none' : 'transform 0.3s ease-out'};
  transform: translateY(${props => props.offset}px);
  will-change: transform;
  user-select: none;
`;

const EfficientCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: ${(props) => props.type === "shuttle" ? "6px solid #001C4A" : "6px solid #C00305"};
  height: 160px; // 140px에서 160px로 증가
  box-sizing: border-box;
`;

const TransportInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const BusNumber = styled.div`
  font-size: clamp(1rem, 4.8vw, 1.38rem);
  font-weight: bold;
`;

const TimeInfo = styled.div`
  text-align: right;
  
  div:first-child {
    color: #666;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  div:last-child {
    font-size: 18px;
    font-weight: bold;
    color: #0066ff;
  }
`;

const SeatInfo = styled.div`
  color: #0066ff;
  font-size: 14px;
  margin-top: 5px;
`;

const UserInfo = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9em;
`;

const Footer = styled.footer`
  background-color: #333;
  color: #fff;
  text-align: right;
  padding: 15px;
  width: 100%;
  box-sizing: border-box;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 10;
  
  @media (min-width: 768px) {
    position: relative;
    margin-top: auto;
  }
`;


const MainPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [direction, setDirection] = useState("giheung-to-mju");
  const [currentCardIndex, setCurrentCardIndex] = useState({ mju: 0, gih: 0 });
  const [fastestTransports, setFastestTransports] = useState({
    mju: [],
    gih: [],
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [isDragging, setIsDragging] = useState({ mju: false, gih: false });
  const [startY, setStartY] = useState({ mju: 0, gih: 0 });
  const [currentTranslate, setCurrentTranslate] = useState({ mju: 0, gih: 0 });
  const [prevTranslate, setPrevTranslate] = useState({ mju: 0, gih: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      fetchEfficientTransport();
    }
  }, [location]);

  const handleDragStart = (e, type) => {
    setIsDragging(prev => ({ ...prev, [type]: true }));
    setStartY(prev => ({
      ...prev,
      [type]: e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    }));
    setPrevTranslate(prev => ({ ...prev, [type]: currentTranslate[type] }));
  };

  const handleDragMove = (e, type) => {
    if (!isDragging[type]) return;
    e.preventDefault();
    
    const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const diff = currentY - startY[type];
    const newTranslate = prevTranslate[type] + diff;
    
    if (newTranslate > 0) {
      setCurrentTranslate(prev => ({ ...prev, [type]: 0 }));
    } else if (newTranslate < -(fastestTransports[type].length - 1) * 180) {
      setCurrentTranslate(prev => ({ 
        ...prev, 
        [type]: -(fastestTransports[type].length - 1) * 180 
      }));
    } else {
      setCurrentTranslate(prev => ({ ...prev, [type]: newTranslate }));
    }
  };

  const handleDragEnd = (type) => {
    setIsDragging(prev => ({ ...prev, [type]: false }));
    const cardHeight = 180;
    const newIndex = Math.round(Math.abs(currentTranslate[type]) / cardHeight);
    setCurrentCardIndex(prev => ({ ...prev, [type]: newIndex }));
    setCurrentTranslate(prev => ({
      ...prev,
      [type]: -newIndex * cardHeight
    }));
  };

  const handleDirectionChange = (newDirection) => {
    setDirection(newDirection);
    setCurrentCardIndex({ mju: 0, gih: 0 });
  };

  const isLoggedIn = () => {
    return !!(
      localStorage.getItem("studentId") ||
      localStorage.getItem("isLoggedIn") === "true"
    );
  };

  const getUserDisplayName = () => {
    const kakaoUser = JSON.parse(localStorage.getItem("kakaoUser"));
    if (kakaoUser?.nickname) {
      return kakaoUser.nickname;
    }
    return localStorage.getItem("studentId") || "사용자";
  };

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    localStorage.removeItem("phoneNumber");
    localStorage.removeItem("kakaoUser");
    localStorage.removeItem("kakaoToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginType");
    window.location.reload();
  };

  const fetchEfficientTransport = async () => {
    try {
      setLoading(true);
      const [mjuResponse, gihResponse] = await Promise.all([
        fetch(`http://localhost:8000/bus/mju-to-giheung`),
        fetch(`http://localhost:8000/bus/giheung-to-mju`),
      ]);
      const [mjuBusData, gihBusData] = await Promise.all([
        mjuResponse.json(),
        gihResponse.json(),
      ]);

      const busTimes = {
        셔틀: 20,
        5600: 32,
        5005: 38,
        "5003A": 43,
        "5003B": 43,
        820: 44,
      };

      const calculateArrivalTime = (departureMinutes, busType) => {
        const now = new Date();
        const departureTime = new Date(now.getTime() + departureMinutes * 60000);
        const travelTime = busTimes[busType] || 30;
        return new Date(departureTime.getTime() + travelTime * 60000);
      };

      const processTransports = async (busData, direction) => {
        const transports = busData.map((bus) => ({
          type: "bus",
          number: bus.버스번호,
          departureTime: parseInt(bus.도착시간) || Infinity,
          arrivalTime: calculateArrivalTime(
            parseInt(bus.도착시간),
            bus.버스번호
          ),
          remainingSeats: bus.남은좌석수 || "정보 없음",
          direction: direction,
        }));

        try {
          const shuttleResponse = await fetch(
            `http://localhost:8000/shuttle/${direction}`
          );
          const shuttleData = await shuttleResponse.json();
          if (shuttleData?.time) {
            transports.push({
              type: "shuttle",
              number: shuttleData.nextShuttle || "셔틀",
              departureTime: parseInt(shuttleData.time),
              arrivalTime: calculateArrivalTime(
                parseInt(shuttleData.time),
                "셔틀"
              ),
              remainingSeats: "정보 없음",
              direction: direction,
            });
          }
        } catch (error) {
          console.error("셔틀 정보를 가져오는 중 오류 발생:", error);
        }

        return transports
          .filter((transport) => transport.departureTime !== Infinity)
          .sort((a, b) => a.arrivalTime - b.arrivalTime)
          .slice(0, 3);
      };

      const mjuTransports = await processTransports(
        mjuBusData,
        "mju-to-giheung"
      );
      const gihTransports = await processTransports(
        gihBusData,
        "giheung-to-mju"
      );

      setFastestTransports({
        mju: mjuTransports,
        gih: gihTransports,
      });
    } catch (error) {
      console.error("효율적인 교통수단 정보를 가져오는 중 오류 발생:", error);
      setFastestTransports({ mju: [], gih: [] });
    } finally {
      setLoading(false);
    }
  };

  const renderTransportCards = (type) => (
    <DirectionColumn>
      <EfficientCardViewport
        onTouchStart={(e) => handleDragStart(e, type)}
        onTouchMove={(e) => handleDragMove(e, type)}
        onTouchEnd={() => handleDragEnd(type)}
        onMouseDown={(e) => handleDragStart(e, type)}
        onMouseMove={(e) => handleDragMove(e, type)}
        onMouseUp={() => handleDragEnd(type)}
        onMouseLeave={() => isDragging[type] && handleDragEnd(type)}
      >
        <EfficientCardContainer
          isDragging={isDragging[type]}
          offset={currentTranslate[type]}
        >
          {fastestTransports[type].map((transport, index) => (
            <EfficientCard key={index} type={transport.type}>
              <TransportInfo>
                <BusNumber>{transport.number}</BusNumber>
                <TimeInfo>
                  <div>
                    {type === "mju" ? "명지대 → 기흥역" : "기흥역 → 명지대"}
                  </div>
                  <div>
                    {transport.arrivalTime instanceof Date
                      ? transport.arrivalTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "정보 없음"}
                  </div>
                </TimeInfo>
              </TransportInfo>
              <SeatInfo>잔여 좌석: {transport.remainingSeats}</SeatInfo>
            </EfficientCard>
          ))}
        </EfficientCardContainer>
      </EfficientCardViewport>
    </DirectionColumn>
  );


  return (
    <AppContainer>
      <HeaderContainer>
        <HomerunLink to="/">Homerun</HomerunLink>
        {isLoggedIn() ? (
          <UserInfo>
            <span>{getUserDisplayName()}님</span>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </UserInfo>
        ) : (
          <LoginLink to="/login">Longin</LoginLink>
        )}
        <MenuContainer>
          <MenuItem
            to={`/info?direction=${direction}`}
            active={location.pathname === "/info"}
            isinfo={true}
          >
            <img src={busInfoIcon} alt="Info" />
             정보
          </MenuItem>
          <MenuItem
            to="/taxi"
            active={location.pathname === "/taxi"}
            isinfo={false}
          >
            <img src={taxiIcon} alt="Taxi" />
            택시
          </MenuItem>
        </MenuContainer>
        {location.pathname === "/" && (
          <>
            <TimeContainer>현재 시간 : {currentTime}</TimeContainer>
            {loading ? (
              <div>로딩 중...</div>
            ) : (
              <CardContainer>
                {renderTransportCards("mju")}
                {renderTransportCards("gih")}
              </CardContainer>
            )}
          </>
        )}
        <DirectionControls
          show={location.pathname === "/info" || location.pathname === "/taxi"}
          direction={direction}
          onDirectionChange={handleDirectionChange}
        />
        <Outlet context={{ direction }} />
      </HeaderContainer>
      <Footer>
        © 아2조디어 | HomeRun | 백병재 강병수 박영찬 이승현
      </Footer>
    </AppContainer>
  );
};

export default MainPage;
