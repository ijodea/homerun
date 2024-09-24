const express = require('express');
const axios = require('axios');
const app = express();

// 공공데이터포털에서 발급받은 API 키
const apiKey = '84ywy4DTPEEvBpkW%2BhAJgOgYI7i2JuGRhqkKRfhD9vZ0mvJb36PKT%2FdS8eVQ6S2dxceQNyIl0hq%2FKkfgbkYvpQ%3D%3D';

// 특정 버스 번호의 노선 ID를 가져오는 함수
async function getBusRouteId(busNumber) {
    const url = `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteList?serviceKey=${apiKey}&keyword=${busNumber}`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        // XML 응답에서 routeId 추출
        const routeIdMatch = data.match(/<routeId>(.*?)<\/routeId>/);
        if (routeIdMatch) {
            const routeId = routeIdMatch[1];
            return { busNumber, routeId };
        } else {
            return { message: 'No route information available for this bus number.' };
        }
    } catch (error) {
        console.error('Error fetching bus route ID:', error);
        return { message: 'Error retrieving bus route ID.' };
    }
}

// API 엔드포인트: 특정 버스 번호의 노선 ID를 조회
app.get('/api/route-id/:busNumber', async (req, res) => {
    const busNumber = req.params.busNumber;
    const routeInfo = await getBusRouteId(busNumber);
    res.json(routeInfo);
});

// 서버 실행
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
