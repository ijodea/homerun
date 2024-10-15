import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext } from "react-router-dom";

const CardContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 20px 0;
`;

const Card = styled.div`
    background: white; /* 카드 배경색을 흰색으로 설정 */
    border: 6px solid ${(props) => (props.type === 'shuttle' ? '#001C4A' : '#C00305')};
    border-radius: 8px;
    padding: 20px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1 1 calc(33.33% - 20px);
    max-width: 300px;
    text-decoration: none;
    color: black; /* 기본 글자 색상 검정 */
    transition: box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 160px; /* 카드 높이 조정 */
    max-height: 160px; /* 최대 카드 높이 조정 */
    min-height: 160px; /* 최소 카드 높이 조정 */

    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        flex: 1 1 calc(50% - 20px);
    }

    @media (max-width: 480px) {
        flex: 1 1 100%;
    }
`;

const Title = styled.h2`
    text-align: center;
    color: white; /* 제목 글자 색상 흰색 */
    background-color: ${(props) => (props.type === 'shuttle' ? '#001C4A' : '#C00305')}; /* 카드 유형에 따라 제목 배경색 설정 */
    padding: 10px; /* 제목 주변 여백 */
    border-radius: 4px; /* 둥글게 처리 */
    font-size: 1.5em;
    margin-bottom: 10px;
`;

const InfoItem = styled.div`
    text-align: left;
    margin: 2px 0; 
`;

const Info = () => {
    const [busInfo, setBusInfo] = useState([]);
    const [shuttleInfo, setShuttleInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { direction } = useOutletContext(); // 방향 가져오기

    const fetchBusInfo = async () => {
        try {
            const response = await fetch(`http://localhost:8000/bus/${direction}`);
            if (!response.ok) {
                throw new Error('네트워크 오류입니다.');
            }
            const data = await response.json();
            const filteredBusInfo = data.map((bus) => ({
                busNumber: bus.버스번호, // 버스 번호를 가져옴
                arrivalTime: bus.도착시간 || '정보 없음',
                remainingSeats: bus.남은좌석수 || '정보 없음',
                type: 'bus',
            }));
            setBusInfo(filteredBusInfo);
        } catch (error) {
            setError("버스 정보를 불러오는 데 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const fetchShuttleInfo = async () => {
        try {
            const response = await fetch(`${direction}`);
            if (!response.ok) {
                throw new Error('네트워크 오류입니다.');
            }
            const data = await response.json();
            const filteredShuttlesInfo = data.map((shuttle) => ({
                busNumber: "셔틀",
                arrivalTime: shuttle.도착시간 || '정보 없음',
                remainingSeats: shuttle.남은좌석수 || '정보 없음',
                type: 'shuttle',
            }));
            setShuttleInfo(filteredShuttlesInfo);
        } catch (error) {
            setShuttleInfo([{
                busNumber: "셔틀",
                arrivalTime: '정보 없음',
                remainingSeats: '정보 없음',
                type: 'shuttle',
            }]); // 기본 셔틀 카드 추가
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusInfo();
        fetchShuttleInfo();
    }, [direction]); // 방향 변경 시 정보 재호출

    const sortedInfo = [...busInfo, ...shuttleInfo]; // 셔틀 정보 추가

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <CardContainer>
            {sortedInfo.map((info, index) => (
                <Card key={index} type={info.type}>  
                    <Title type={info.type}>{info.type === 'shuttle' ? '셔틀' : `${info.busNumber}`}</Title> {/* type을 Title에 전달 */}
                    <div>
                        <InfoItem>
                            <strong>도착 시간:</strong> {info.arrivalTime}
                        </InfoItem>
                        <InfoItem>
                            <strong>탑승 인원:</strong> {info.remainingSeats}
                        </InfoItem>
                    </div>
                </Card>
            ))}
        </CardContainer>
    );
};

export default Info;
