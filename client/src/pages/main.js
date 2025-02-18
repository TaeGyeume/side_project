import React from 'react';
import TourTicketList from '../components/tourTicket/TourTicketList';
import PopularProductsSlider from '../components/views/PopularProductsSlider';
import 'bootstrap/dist/css/bootstrap.min.css';

const Main = () => {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">메인페이지입니다</h2>

      {/* ✅ Flexbox 기반 레이아웃 적용 */}
      <div className="main-layout">
        {/* 메인 컨텐츠 */}
        <div className="main-content">
          <h3>지역 필수 티켓</h3>
          <TourTicketList />
        </div>
        <div>
          {/* <PopularProductsSlider /> */}
        </div>
      </div>
    </div>
  );
};

export default Main;
