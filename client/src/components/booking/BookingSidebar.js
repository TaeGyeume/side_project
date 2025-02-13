import React from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import './styles/BookingSidebar.css'; // 스타일 적용

const BookingSidebar = () => {
  const location = useLocation(); // 현재 URL 정보 가져오기

  return (
    <div className="sidebar">
      <h3 className="sidebar-title">내 여행</h3>
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/booking/my?status=completed"
            className={({isActive}) =>
              isActive && location.search.includes('status=completed') ? 'active' : ''
            }>
            예약 완료
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/booking/my?status=canceled"
            className={({isActive}) =>
              isActive && location.search.includes('status=canceled') ? 'active' : ''
            }>
            예약 취소
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default BookingSidebar;
