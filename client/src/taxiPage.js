import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import "./App.css";
import "./card.css";
import { useOutletContext } from "react-router-dom";

const SelectText = styled.div`
    margin: 12px; 
    color: #666; 
    text-align: left;
    font-size: 13px; 
    font-weight: bold;
    margin-bottom: 0;
`;

const Select = styled.select`
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 15px;
    margin: 7px 18px 5px 7px;
    cursor: pointer;
    width: 370px;

    &:hover {
        border-color: #007bff;
    }
`;

const TaxiGroupBtn = styled(Link)`
    display: block;
    background-color: #007bff;
    text-align : center;
    color: white;
    border-radius: 3px;
    font-size: 13px;
    text-decoration: none;
    padding: 5px;
    margin: 8px 8px 6px; 
    width: 15%;

    &:hover {
        transition: color 0.2s ease; 
        background-color: #0056b3;
    }
`;

function TaxiPage() {
    const [selectedDirection, setSelectedDirection] = useState("방향 선택");
    const { direction } = useOutletContext(); // 방향 가져오기
    const dir = (direction === "/api/giheung-to-mju" ? "명지대행" : "기흥역행")
    
    useEffect(() => {
        const savedDirection = localStorage.getItem("selectedDirection");
        if (savedDirection) {
            setSelectedDirection(savedDirection);
        }
    }, []);

    const handleSelectChange = (event) => {
        const direction = event.target.value;
        setSelectedDirection(direction);

        localStorage.setItem("selectedDirection", direction);
    };

    return (
        <div className="card-container">
            <div className="card">
                    <div className="card-header">{dir}</div>
                <SelectText>방향 선택:</SelectText>
                <Select value={direction} onChange={handleSelectChange}>
                    <option value="학교 → 기흥역">학교 → 기흥역</option>
                    <option value="기흥역 → 학교">기흥역 → 학교</option>
                </Select>
                <TaxiGroupBtn to="/taxiGroup">택시 모집</TaxiGroupBtn>
            </div>
        </div>
    );
}

export default TaxiPage;
