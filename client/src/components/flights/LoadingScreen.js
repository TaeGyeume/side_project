import React from 'react';
import './styles/LoadingScreen.css';

const LoadingScreen = () => (
  <div className="loading-screen">
    <img src="/images/screen/flightsloading2.gif" alt="Loading..." />
    <p>검색 중...</p>
  </div>
);

export default LoadingScreen;
