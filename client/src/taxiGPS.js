import React, { useState } from 'react';

function App() {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // 목표 장소 설정
        const destination = 'mju'; // 'mju' 또는 'gh'로 변경 가능

        // 백엔드 API 호출
        try {
          const response = await fetch('http://localhost:8000/api/location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ latitude, longitude, to: destination }),
          });

          const result = await response.json();
          setMessage(result.message); // 백엔드에서 온 메시지 처리
        } catch (error) {
          console.error('Error:', error);
          setMessage('위치 전송에 실패했습니다.');
        }
      }, (error) => {
        console.error('Error getting location:', error);
        setMessage('위치 정보를 가져오는 데 실패했습니다.');
      });
    } else {
      setMessage('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  };

  return (
    <div>
      <h1>GPS 위치 전송</h1>
      <button onClick={getLocation}>내 위치 보내기</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
