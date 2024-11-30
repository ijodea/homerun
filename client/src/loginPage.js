import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import HomerunLink from "./homeRunLink";
import kakaoLoginImg from "./assets/kakao_login.png";

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

const LoginBtn = styled.button`
  width: 13%;
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

const KakaoLoginBtn = styled.img`
  width: 13%;
  cursor: pointer;
  margin-top: 10px;
`;

function LoginPage() {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    const value = e.target.value;
    setStudentName(value);
  };
  
  const handleStudentIdChange = (e) => {
    // 숫자만 허용
    const value = e.target.value.replace(/\D/g, "");
    setStudentId(value);
  };

  const handlePhoneNumberChange = (e) => {
    // 숫자만 허용
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    console.log("Login State:", { studentName, studentId, phoneNumber });

    // 로컬 스토리지 저장
    localStorage.setItem("studentName", studentName);
    localStorage.setItem("studentId", studentId);
    localStorage.setItem("phoneNumber", phoneNumber);

    // 메인 페이지로 이동
    navigate("/", { state: { studentName, studentId, phoneNumber } });
  };

  const handleKakaoLogin = () => {
    window.location.href = "http://localhost:8000/auth/kakao-login-page";
  };

  return (
    <Container>
      <HomerunLink />
      <InputContainer>
        <Input
          type="text"
          placeholder="이름을 입력하세요"
          value={studentName}
          onChange={handleNameChange}
          required
        />
      </InputContainer>
      <InputContainer>
        <Input
          type="text"
          placeholder="학번을 입력하세요"
          value={studentId}
          onChange={handleStudentIdChange}
          required
        />
      </InputContainer>
      <InputContainer>
        <Input
          type="tel"
          placeholder="전화번호를 입력하세요"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          required
        />
      </InputContainer>
      <ButtonContainer>
        <LoginBtn onClick={handleLoginClick}>로그인</LoginBtn>
        <KakaoLoginBtn src={kakaoLoginImg} onClick={handleKakaoLogin} />
      </ButtonContainer>
    </Container>
  );
}

export default LoginPage;
