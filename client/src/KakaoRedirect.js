import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const KakaoRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  useEffect(() => {
    const processKakaoLogin = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");

      if (!code) {
        setError("인증 코드를 찾을 수 없습니다.");
        setTimeout(() => navigate("/login", { replace: true }), 3000);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/oauth`, {
          params: { code },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Accept: "application/json",
          },
          withCredentials: true,
        });

        console.log("Server response:", response.data);

        if (!response.data?.userData || !response.data?.tokenInfo) {
          throw new Error("Invalid response data");
        }

        const { userData, tokenInfo } = response.data;

        // 로그인 정보 저장
        localStorage.clear(); // 기존 데이터 모두 제거

        const userInfo = {
          id: userData.id,
          nickname: userData.properties?.nickname || "사용자",
          isKakao: true,
        };

        localStorage.setItem("kakaoUser", JSON.stringify(userInfo));
        localStorage.setItem(
          "kakaoToken",
          JSON.stringify({
            accessToken: tokenInfo.access_token,
            expiresIn: tokenInfo.expires_in,
            tokenType: tokenInfo.token_type,
          })
        );
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginType", "kakao");

        // 메인 페이지로 리다이렉트
        navigate("/", {
          replace: true,
          state: {
            loginSuccess: true,
            user: userInfo,
          },
        });
      } catch (error) {
        console.error("카카오 로그인 처리 중 오류:", error);
        console.error("에러 세부 정보:", error.response?.data);

        setError(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "로그인 처리 중 오류가 발생했습니다."
        );

        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    processKakaoLogin();
  }, [location.search, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          {error ? (
            <>
              <h2 className="mb-2 text-xl font-semibold text-red-600">
                로그인 오류
              </h2>
              <p className="text-red-500">{error}</p>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-semibold">
                카카오 로그인 처리 중...
              </h2>
              <p className="text-gray-600">잠시만 기다려주세요.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KakaoRedirect;
