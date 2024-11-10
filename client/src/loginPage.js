import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom"; 
import HomerunLink from "./homeRunLink";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;     
    justify-content: center; 
    height: 100vh;          
    margin-top: 0;         
`;

const InputContainer = styled.div`
    width: 300px;          
    margin: 10px 0;       
`;

const Input = styled.input`
    width: 100%; 
    margin-top: 7px;
    padding: 10px;         
    border: 1px solid #ccc; 
    border-radius: 5px;     
    font-size: 16px;        
`;

const ButtonContainer = styled.div`
    display: flex;          
    flex-direction: column; 
    align-items: center;    
    width: 100%;           
    margin: 20px 0 0;     
`;

const Button = styled.button`
    width: 50%;           
    padding: 10px;          
    font-size: 16px;        
    color: white;          
    background-color: #007bff; 
    border: none;           
    border-radius: 5px;    
    cursor: pointer;        

    &:hover {
        background-color: #0056b3; 
    }
`;

const SignupText = styled.p`
    margin: 10px 0;       
    font-size: 14px;      
    color: #007bff;        
    cursor: pointer;       
    
    &:hover {
        text-decoration: underline; 
    }
`;

function Login() {
    const [studentId, setStudentId] = useState(""); // 학번 상태
    const [phoneNumber, setPhoneNumber] = useState(""); // 전화번호 상태
    const navigate = useNavigate(); 

    const handleSubmit = (e) => {
        e.preventDefault();
        // 로컬 스토리지에 데이터 저장
        localStorage.setItem("studentId", studentId);
        localStorage.setItem("phoneNumber", phoneNumber);
        
        // 회원가입 페이지로 이동
        navigate("/signup", { state: { studentId, phoneNumber } }); // navigate 사용
    };

    return (
        <Container>
            <HomerunLink />
            <form onSubmit={handleSubmit}>
                <InputContainer>
                    <Input
                        type="text"
                        placeholder="학번을 입력하세요"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)} // 학번 입력 핸들러
                        required
                    />
                </InputContainer>
                <InputContainer>
                    <Input
                        type="tel"
                        placeholder="전화번호를 입력하세요"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)} // 전화번호 입력 핸들러
                        required
                    />
                </InputContainer>
                <ButtonContainer>
                    <SignupText>회원가입하기</SignupText> 
                    <Button type="submit">로그인</Button>
                </ButtonContainer>
            </form>
        </Container>
    );
}

export default Login;
