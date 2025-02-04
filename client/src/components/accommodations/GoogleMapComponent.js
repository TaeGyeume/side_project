import React from 'react';
import {GoogleMap, LoadScript, Marker} from '@react-google-maps/api';

const MapComponent = ({lat, lng}) => {
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: parseFloat(lat), // 위도
    lng: parseFloat(lng) // 경도
  };

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={15}>
        {/* ✅ `Marker`를 사용하여 지도에 표시 */}
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
