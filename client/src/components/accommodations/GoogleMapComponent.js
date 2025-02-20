// ✅ LoadScript를 따로 분리하여 한 번만 로드하도록 수정
import React from 'react';
import {GoogleMap, Marker, useJsApiLoader} from '@react-google-maps/api';

const MapComponent = ({lat, lng}) => {
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // ✅ Google Maps API 로드를 useJsApiLoader로 한 번만 실행
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey
  });

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '15px', // ✅ 라운딩 처리
    overflow: 'hidden', // ✅ 테두리 밖으로 넘치는 부분 숨기기
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)' // ✅ 그림자 효과 추가 (선택 사항)
  };

  const center = {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };

  // ✅ 로딩 중일 때 표시할 UI
  if (!isLoaded) return <div>지도 로딩 중...</div>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={15}>
      <Marker position={center} />
    </GoogleMap>
  );
};

export default MapComponent;
