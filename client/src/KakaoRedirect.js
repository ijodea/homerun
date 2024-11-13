import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function KakaoRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');
    if (code) {
      axios
        .post('/auth/kakao', { accessToken: code })
        .then((response) => {
          // 로그인 성공 처리
          localStorage.setItem('user', JSON.stringify(response.data));
          navigate('/');
        })
        .catch((error) => {
          console.error('카카오 로그인 실패:', error);
        });
    }
  }, [navigate]);

  return <div>카카오 로그인 중...</div>;
}

export default KakaoRedirect;
