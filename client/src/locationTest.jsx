import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TaxiLocationTest = () => {
  const [userId, setUserId] = useState('');
  const [destination, setDestination] = useState('gh');
  const [latitude, setLatitude] = useState('-');
  const [longitude, setLongitude] = useState('-');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [currentGroupId, setCurrentGroupId] = useState(null);

  // 그룹 상태 주기적 확인
  useEffect(() => {
    let intervalId;
    
    if (currentGroupId) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/taxi/group/${currentGroupId}`);
          const data = await response.json();
          
          if (data.success) {
            setResponse(prev => ({
              ...prev,
              data: {
                ...prev.data,
                group: {
                  ...prev.data.group,
                  memberCount: data.memberCount,
                  isFull: data.isFull
                }
              },
              message: `${prev.message.split('|')[0]} | 그룹 번호: ${data.groupId} (${data.memberCount}/4명)`
            }));
          }
        } catch (err) {
          console.error('그룹 상태 확인 중 오류:', err);
        }
      }, 3000); // 3초마다 확인
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentGroupId]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setError('');
        },
        (error) => {
          setError('위치 정보를 가져올 수 없습니다: ' + error.message);
        }
      );
    } else {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async () => {
    if (!userId) {
      setError('사용자 ID를 입력해주세요.');
      return;
    }

    if (latitude === '-' || longitude === '-') {
      setError('위치 정보를 가져올 수 없습니다.');
      return;
    }

    try {
      const locationData = {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        to: destination
      };

      const response = await fetch('/api/taxi/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      const result = await response.json();
      setResponse(result);
      
      // 그룹 ID 설정 (polling 시작을 위해)
      if (result.success && result.data.group) {
        setCurrentGroupId(result.data.group.groupId);
      }
    } catch (err) {
      setError('서버 요청 중 오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">택시 위치 테스트</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">사용자 ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">목적지:</label>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span>기흥역</span>
            <div className="relative inline-block w-12 h-6 mx-4">
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={destination === 'mju'}
                onChange={(e) => setDestination(e.target.checked ? 'mju' : 'gh')}
              />
              <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${destination === 'mju' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <span className={`absolute h-5 w-5 bg-white rounded-full transition-all duration-300 ${destination === 'mju' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </span>
            </div>
            <span>명지대</span>
          </div>
          <div className="text-center mt-2 font-medium">
            {destination === 'mju' ? '명지대 방면' : '기흥역 방면'}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="mb-2">위도: {latitude}</div>
          <div>경도: {longitude}</div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          위치 전송하기
        </button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {response && (
          <div className={`p-4 rounded ${response.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p>{response.message}</p>
            {response.data.group && (
              <p className="mt-2">
                현재 인원: {response.data.group.memberCount}/4
                {response.data.group.isFull && ' (모집 완료)'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxiLocationTest;