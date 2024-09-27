import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const CardContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px 0;
`;

const Card = styled(Link)`
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 300px;
    text-decoration: none;
    color: black;
    transition: box-shadow 0.3s;

    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: #f7f7f7;
    }
`;

const Title = styled.h2`
    text-align: center;
    color: #007bff;
`;

const BusInfoMtoG = () => {
    const [busInfo, setBusInfo] = useState([]); // 버스 정보를 저장할 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    const fetchBusleInfo = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/mju-to-giheung');
            console.log('API Response:', response); // 응답 객체 로그

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (Array.isArray(busInfo)) {
                // 버스 정보가 배열일 때 처리
                console.log("Received bus info:", busInfo);
            } else {
                // 배열이 아닐 경우 처리
                console.log("Received data is not an array:", busInfo);
            }
            setBusInfo(data); // 받은 데이터를 상태에 저장
        } catch (error) {
            console.error('Error fetching bus information:', error);
            setError("버스 정보를 불러오는 데 문제가 발생했습니다.");
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    useEffect(() => {
        fetchBusleInfo();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <CardContainer>
            <Card to="/busDetail">
                <Title>버스 정보</Title>
                <ul>
                    {busInfo.length > 0 ? (
                        busInfo.map((bus) => (
                            <li key={bus.busNumber}>
                                <div style={{ textAlign: "left" }}>
                                    <strong>버스 번호:</strong> {bus.busNumber}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <strong>도착 시간:</strong> {bus.arrivalTime}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <strong>남은 좌석 수:</strong> {bus.remainingSeats}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li>
                            <div style={{ textAlign: "left" }}>
                                <strong>버스 번호:</strong> -
                            </div>
                            <div style={{ textAlign: "left" }}>
                                <strong>도착 시간:</strong> 예정 없음
                            </div>
                            <div style={{ textAlign: "left" }}>
                                <strong>남은 좌석 수:</strong> -
                            </div>
                        </li>
                    )}
                </ul>
            </Card>
        </CardContainer>
    );
};

const ShuttleInfo = () => {
    return (
        <CardContainer>
            <Card to="/shuttleDetail">
                <Title>셔틀 정보</Title>
                <ul>
                    <li>
                        <div style={{ textAlign: "left" }}>
                            <strong>셔틀 시간:</strong> -
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <strong>도착 시간:</strong> 예정 없음
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <strong>남은 좌석 수:</strong> -
                        </div>
                    </li>
                </ul>
            </Card>
        </CardContainer>
    );
};

const InfoSection = () => {
    return (
        <div>
            <BusInfoMtoG />
            <ShuttleInfo />
        </div>
    );
};

export default InfoSection;
