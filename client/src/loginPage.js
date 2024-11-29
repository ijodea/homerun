import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import HomerunLink from "./homeRunLink";
import MainPage from "./mainPage";
import Join from "./joinPage";
import kakaoLoginImg from "./assets/kakao_login.png";
import axios from "axios";

const SERVER_URL = "http://localhost:8000";

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

const JoinLink = styled(Link)`
  margin: 10px 0;
  font-size: 14px;
  color: #007bff;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const KakaoLoginBtn = styled.img`
  width: 50%;
  cursor: pointer;
  margin-top: 10px;
`;

function Login() {
  const [studentName, setStudentName] = useState(""); // 이름 상태
  const [studentId, setStudentId] = useState(""); // 학번 상태
  const [phoneNumber, setPhoneNumber] = useState(""); // 전화번호 상태
  const navigate = useNavigate();

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // 로컬 스토리지에 데이터 저장
  //   localStorage.setItem("studentName", studentName);
  //   localStorage.setItem("studentId", studentId);
  //   localStorage.setItem("phoneNumber", phoneNumber);

  //   //메인 페이지로 이동
  //   navigate("/", { state: { studentName, studentId, phoneNumber } }); // navigate 사용
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${SERVER_URL}/login`, {
        name: studentName,
        studentId,
        phoneNumber,
      });

      // 로그인 정보 저장 (카카오 로그인과 동일한 형식)
      localStorage.clear(); // 기존 데이터 모두 제거

      const userInfo = {
        id: response.data.userData.id,
        nickname: response.data.userData.properties.nickname,
        isKakao: false,
      };

      localStorage.setItem("user", JSON.stringify(userInfo));
      localStorage.setItem(
        "token",
        JSON.stringify({
          accessToken: response.data.tokenInfo.access_token,
          expiresIn: response.data.tokenInfo.expires_in,
          tokenType: response.data.tokenInfo.token_type,
        })
      );
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginType", "normal");

      // 메인 페이지로 리다이렉트
      navigate("/", {
        replace: true,
        state: {
          loginSuccess: true,
          user: userInfo,
        },
      });
    } catch (error) {
      console.error("로그인 실패:", error.response?.data || error.message);
      // 에러 처리를 위한 상태 추가 필요
      alert(error.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = `${SERVER_URL}/auth/kakao-login-page`;
  };

  return (
    <Container>
      <HomerunLink />
      <form onSubmit={handleSubmit}>
        <InputContainer>
          <Input
            type="text"
            placeholder="이름을 입력하세요"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)} // 이름 입력 핸들러
            required
          />
        </InputContainer>
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
          <JoinLink to="/join">회원가입하기</JoinLink>
          <LoginBtn to="/">로그인</LoginBtn>
          <KakaoLoginBtn src={kakaoLoginImg} onClick={handleKakaoLogin} />
        </ButtonContainer>
      </form>
    </Container>
  );
}

export default Login;
