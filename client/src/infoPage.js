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
    background: white;
    border: 6px solid ${({ type }) => (type === 'shuttle' ? '#001C4A' : '#C00305')};
    border-radius: 8px;
    padding: 20px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1 1 calc(33.33% - 20px);
    max-width: 300px;
    text-decoration: none;
    color: black;
    transition: box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 200px;
    max-height: 200px;
    min-height: 200px;

    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: #f7f7f7;
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
    color: #007bff;
    font-size: 1.5em;
    margin-bottom: 10px;
`;

const InfoItem = styled.div`
    text-align: left;
    margin: 2px 0; 
`;

const Info = () => {
    const [busInfo, setBusInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { direction } = useOutletContext(); // 방향 가져오기

    const fetchBusInfo = async () => {
        try {
            console.log("Fetching bus info for direction:", direction); // 확인용 로그
            const response = await fetch(`http://localhost:8000/api/${direction}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
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

    useEffect(() => {
        fetchBusInfo();
    }, [direction]); // direction 변경 시 fetchBusInfo 호출

    const shuttleInfo = [
        { type: 'shuttle', arrivalTime: '정보 없음', remainingSeats: '-', busNumber: '셔틀' },
    ];

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
                    <Title>{info.type === 'shuttle' ? info.busNumber : info.busNumber}</Title> 
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
