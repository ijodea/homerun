const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');
const app = express();

app.use(cors());

// 공공데이터포털에서 발급받은 API 키
const apiKey = '84ywy4DTPEEvBpkW%2BhAJgOgYI7i2JuGRhqkKRfhD9vZ0mvJb36PKT%2FdS8eVQ6S2dxceQNyIl0hq%2FKkfgbkYvpQ%3D%3D';

// 명지대 정류장 ID와 기흥역 정류장 ID
const myeongjiUniversityStationId = '228002959'; //228000748
const giheungStationId = '228000696';

// 버스 번호와 routeId를 매핑하는 객체
const busRouteMap = {
    '5005': '228000175',  //
    '820': '228000012', //
    '5600': '228000184', //
    '5003A': '228000431',
    '5003B': '228000182' 
    
};

// 실시간 버스 도착 정보 가져오기 함수
async function getBusArrivalInfo(stationId, busNumbers) {
    const url = `http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList?serviceKey=${apiKey}&stationId=${stationId}`;
    const parser = new xml2js.Parser();

    try {
        const response = await axios.get(url);
        const xmlData = response.data;

        // XML 데이터를 JSON으로 변환
        const jsonData = await parser.parseStringPromise(xmlData);

        console.log('API 응답 데이터:', JSON.stringify(jsonData, null, 2));
        
        // 응답 데이터에서 필요한 정보 추출
        if (jsonData.response && jsonData.response.msgBody[0].busArrivalList) {
            const items = jsonData.response.msgBody[0].busArrivalList;

            // 매핑된 버스 번호의 정보만 추출
            const filteredBusInfo = items
                .filter(item => Object.values(busRouteMap).includes(item.routeId[0])) // 특정 버스 번호만 필터링
                .map(item => ({
                    버스번호: Object.keys(busRouteMap).find(key => busRouteMap[key] === item.routeId[0]), // 버스 번호 찾기
                    도착시간: `${item.predictTime1[0]}분 후 도착`, // 도착 예상 시간
                    남은좌석수: item.remainSeatCnt1[0] === '-1' ? '정보 없음' : `${item.remainSeatCnt1[0]}석 남음`
                }));
            console.log('필터링된 버스 정보:', filteredBusInfo);
            return filteredBusInfo.length ? filteredBusInfo : { message: 'No relevant bus arrival information available' };
        } else {
            console.log('도착 정보가 없습니다:', jsonData.response);
            return { message: 'No arrival information available' };
        }
    } catch (error) {
        console.error('Error fetching bus arrival info:', error);
        return { message: 'Error retrieving bus information' };
    }
}



// API 엔드포인트: 명지대 -> 기흥역 버스 도착시간 및 남은 좌석 수
app.get('/api/mju-to-giheung', async (req, res) => {
    const busNumbers = ['5005', '820', '5600', '5003A', '5003B']; // 추적할 버스 번호
    try {
        const busInfo = await getBusArrivalInfo(myeongjiUniversityStationId, busNumbers);
        res.json(busInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bus information' });
    }
});

// API 엔드포인트: 기흥역 -> 명지대
app.get('/api/giheung-to-mju', async (req, res) => {
    const busNumbers = ['5005', '820', '5600', '5003A', '5003B']; // 추적할 버스 번호
    try {
        const busInfo = await getBusArrivalInfo(giheungStationId, busNumbers);
        res.json(busInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bus information' });
    }
});

// 서버 실행
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
