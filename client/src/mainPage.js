import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import DirectionControls from "./directioncontrols";
import taxiIcon from "./assets/Taxi.png";
import busInfoIcon from "./assets/Bus.png";
import profileIcon from "./assets/profile.png"
import Login from "./loginPage";
import logo from "./assets/logo.png";
import "./App.css";

const SERVER_URL = "http://localhost:8000";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100vw;
  min-height: 100vh; 
  overflow-y: auto; 
  overflow-x: hidden; 
`;

const HeaderContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex-grow: 1;
  overflow: hidden;
`;

const HomerunLink = styled(Link)`
  color: #007bff;
  font-size: 1.5em;
  font-weight: bold;
  text-decoration: none;
  margin: 10px 20px;
  display: flex;
  align-items: center;
  gap : 15px;
  img {
    height: 60px;
    max-width: 100%;
    object-fit: contain;
    
    @media (max-width: 400px) {
      display: none;
    }
    
    @media (min-width: 401px) and (max-width: 768px) {
      height: 30px;
    }
    
    @media (min-width: 769px) {
      height: 40px;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProfileImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 24px; 
    height: 24px;
  }
`;

const ProfileContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column; 
  align-items: center; 
  gap: 5px; 
  margin-top: 0px; 

  @media (max-width: 768px) {
    gap: 4px; 
    margin: 2px 0px 0px 5px;
  }
`;

const ProfileName = styled.div`
  font-size: 0.9em;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 0.5em; 
  }
`;

const EfficientCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 
              0 2px 4px rgba(0, 0, 0, 0.19);
  border: ${(props) => props.type === "shuttle" ? "6px solid #001C4A" : "6px solid #C00305"};
  height: 160px;
  box-sizing: border-box;
`;

const LogoutButton = styled.button`
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  color: black;
  font-size: 0.9em;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: #f0f0f0;
  }
`;


const LoginLink = styled(Link)`
  color: black;
  font-size: 0.9em;
  text-decoration: none;
  margin: 10px 20px;
  display: flex;
  align-items: center;
  gap : 15px;
  img {
    height: 60px;
    max-width: 100%;
    object-fit: contain;
    
    @media (max-width: 400px) {
      display: none;
    }
    
    @media (min-width: 401px) and (max-width: 768px) {
      height: 30px;
    }
    
    @media (min-width: 769px) {
      height: 40px;
    }
  }
`;

const MenuContainer = styled.nav`
  display: flex;
  justify-content: center;
  background-color: lightgray;
  padding: 10px 0;
  margin-top: 23px;
  width: 100%;
  overflow-x: auto;
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
    margin-right: 8px;
    filter: ${(props) => (props.active ? "invert(1)" : "invert(0.5)")};
  }

  @media (max-width: 768px) {
    padding: 10px 5px;
    font-size: 1em;
  }

  &:hover {
    background-color: ${(props) =>
    props.active
      ? props.isinfo
        ? "#005700"
        : "#fb9403"
      : "rgba(0, 0, 0, 0.1)"};
  }

  @media (max-width: 768px) {
    padding: 15px;
    font-size: 1.2em;
    img {
      height: 35px;
    }
}
`;

const TimeContainer = styled.div`
  background: white;
  padding: 10px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid #007bff;
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
  max-width: 400px;
  height: 200px; 
  overflow: hidden;
  position: relative;
  margin: 10px auto;
  touch-action: pan-y pinch-zoom;
`;

const EfficientCardContainer = styled.div`
  position: absolute;
  width: 100%;
  transition: ${(props) =>
    props.isDragging ? "none" : "transform 0.3s ease-out"};
  transform: translateY(${(props) => props.offset}px);
  will-change: transform;
  user-select: none;
`;

const TransportCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 
              0 2px 4px rgba(0, 0, 0, 0.19);
  border: ${(props) => props.type === "shuttle" ? "6px solid #001C4A" : "6px solid #C00305"};
  height: 160px;
  box-sizing: border-box;
`;

const TransportInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BusNumber = styled.div`
  font-size: clamp(1rem, 4.8vw, 1.35rem);
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TimeInfo = styled.div`
  text-align: right;
  position: relative;
  div:first-child {
    color: #666;
    font-size: 14px;
    margin-bottom: 5px;
  }
  div:nth-child(2) {
    font-size: 18px;
    font-weight: bold;
    color: #0066ff;
  }
  div:nth-child(3) {
    font-size: 18px;
    font-weight: bold;
    color: 	#FF0000;
  }
`;

const Medal = styled.span`
  position: absolute;
  right: 0;
  bottom: -50px;
  font-size: 30px;
`;

const SeatInfo = styled.div`
  color: #0066ff;
  font-size: 14px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
  position: ${(props) => (props.isMobile ? "static" : "sticky")};
  top: 0;
  background: ${(props) => (props.isMobile ? "none" : "#f0f0f0")};
  padding: ${(props) => (props.isMobile ? "0" : "10px 0")};
  z-index: 1;
`;

const FooterContainer = styled.div`
  display: flex; 
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: #333; 
  padding: 20px;
  box-sizing: border-box; 

  @media (max-width: 768px) {
    position: fixed; 
    bottom: 0;
    left: 0;
    padding: 10px;
    z-index: 10;
    width: 100%;
    height: auto; 
    font-size: 0.8em;
    flex-direction: column; 
    align-items: center;
    gap: 5px; 
  }
`;

const FeedbackLink = styled(Link)`
  color: #fff; 
  font-size: 0.9em; 
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const TeamName = styled.div`
  color: #fff;
  font-size: 0.9em;
`;



const MainPage = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [direction, setDirection] = useState("giheung-to-mju");
  const [showLogout, setShowLogout] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState({ mju: 0, gih: 0 });
  const [fastestTransports, setFastestTransports] = useState({
    mju: [],
    gih: [],
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
  };

  const isLoggedIn = () => {
    return (
      localStorage.getItem("studentId") ||
      localStorage.getItem("isLoggedIn") === "true"
    );
  };

  const handleTaxiClick = (event) => {
    event.preventDefault(); // 기본 링크 동작 방지
    if (isLoggedIn()) {
      navigate("/taxi");
    } else {
      navigate("/login");
    }
  };

  const getUserDisplayName = () => {
    const kakaoUser = JSON.parse(localStorage.getItem("kakaoUser"));
    if (kakaoUser?.nickname) {
      return kakaoUser.nickname;
    }
    return localStorage.getItem("studentId") || "사용자";
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const fetchEfficientTransport = async () => {
    try {
      setLoading(true);
      const [mjuResponse, gihResponse] = await Promise.all([
        fetch(`${SERVER_URL}/bus/mju-to-giheung`),
        fetch(`${SERVER_URL}/bus/giheung-to-mju`),
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
        const departureTime = new Date(
          now.getTime() + departureMinutes * 60000
        );
        const travelTime = busTimes[busType] || 30;
        return new Date(departureTime.getTime() + travelTime * 60000);
      };

      const processTransports = async (busData, direction) => {
        const now = new Date();
        const transports = busData.map((bus) => {
          const departureTime = new Date(now.getTime() + parseInt(bus.도착시간) * 60000);
          return {
            type: "bus",
            number: bus.버스번호,
            departureTime: departureTime,
            arrivalTime: calculateArrivalTime(
              parseInt(bus.도착시간),
              bus.버스번호
            ),
            remainingSeats: direction === "mju-to-giheung" ? "공석" : bus.남은좌석수,
            direction: direction,
          };
        });

        try {
          const shuttleResponse = await fetch(
            `${SERVER_URL}/shuttle/${direction}`
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
              remainingSeats: "탑승 가능",
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
                    출발 : {transport.departureTime instanceof Date
                      ? transport.departureTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "정보 없음"}
                  </div>
                  <div>
                    도착 : {transport.arrivalTime instanceof Date
                      ? transport.arrivalTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "정보 없음"}
                  </div>

                  <Medal>
                    {index === 0 ? "🏅" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
                  </Medal>
                </TimeInfo>
              </TransportInfo>
              <SeatInfo>{transport.remainingSeats}</SeatInfo>
            </EfficientCard>
          ))}
        </EfficientCardContainer>
      </EfficientCardViewport>
    </DirectionColumn>
  );

  return (
    <AppContainer>
      <HeaderContainer>
        <HomerunLink to="/"><img src={logo} alt="logo" />Homerun</HomerunLink>
        {isLoggedIn() ? (
          <UserInfo>
            <ProfileContainer>
              <ProfileImage
                src={profileIcon}
                alt="프로필"
                style={{ marginLeft: "0.5px" }}
                onClick={() => setShowLogout(!showLogout)}
              />
              <ProfileName>{getUserDisplayName()}님</ProfileName>
              {showLogout && (
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
              )}
            </ProfileContainer>
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
            onClick={handleTaxiClick} // 클릭 이벤트가 올바르게 연결되어 있는지 확인
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
                {renderTransportCards("gih")}
                {renderTransportCards("mju")}
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

      <FooterContainer>
        <FeedbackLink to="/feedback">Feedback</FeedbackLink>
        <TeamName>© 아2조디어 | HomeRun | 백병재 강병수 박영찬 이승현</TeamName>
      </FooterContainer>
    </AppContainer>
  );
};

export default MainPage;