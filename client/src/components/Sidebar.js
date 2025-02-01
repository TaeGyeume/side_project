// 상품 카테고리 선택 사이드바

import React from 'react';
import {useNavigate} from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div style={{width: '200px', padding: '20px', borderRight: '1px solid #ddd'}}>
      <h3>상품 카테고리</h3>
      <ul style={{listStyle: 'none', padding: 0}}>
        <li>
          <button onClick={() => navigate('/product/air')}>항공</button>
        </li>
        <li>
          <button onClick={() => navigate('/product/accommodations/list')}>숙소</button>
        </li>
        <li>
          <button onClick={() => navigate('/product/tourTicket/list')}>투어.티켓</button>
        </li>
        <li>
          <button onClick={() => navigate('/product/travel-goods')}>여행용품</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
