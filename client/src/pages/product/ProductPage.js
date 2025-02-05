// Product 메인 페이지

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import TourTicketList from '../../components/product/tourTicket/TourTicketList';
import AccommodationList from '../../pages/product/accommodations/AccommodationList';

const ProductPage = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('accommodations');

  const accommodationsRef = useRef(null);
  const tourTicketRef = useRef(null);

  const scrollToSection = (section) => {
    const sectionRefs = {
      accommodations: accommodationsRef,
      tourTicket: tourTicketRef,
    };

    sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.3 };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    [accommodationsRef, tourTicketRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      <Sidebar activeSection={activeSection} onSelectCategory={scrollToSection} />

      <div style={{ padding: '20px', flex: 1 }}>
        <div id="accommodations" ref={accommodationsRef} style={sectionStyle}>
          <h2>🏨 숙소 상품</h2>
          <AccommodationList />
        </div>

        <div id="tourTicket" ref={tourTicketRef} style={sectionStyle}>
          <div style={headerContainerStyle}>
            <h2>🎟 투어 & 티켓 상품</h2>
            <button onClick={() => navigate('/product/tourTicket/list')} style={plusButtonStyle}>+</button>
          </div>
          <TourTicketList />
        </div>
      </div>
    </div>
  );
};

/* 상품 섹션 스타일 */
const sectionStyle = {
  border: '1px solid #ddd',
  padding: '20px',
  marginBottom: '20px',
  marginLeft:'150px',
  position: 'auto',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
};

/* 제목과 버튼 스타일 */
const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
};

/* + 버튼 스타일 */
const plusButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  fontSize: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
};

// import React, {useRef, useState, useEffect} from 'react';
// import {useNavigate} from 'react-router-dom';

// import Sidebar from '../../components/Sidebar';
// import TourTicketList from '../../components/product/tourTicket/TourTicketList';
// import AccommodationList from '../../pages/product/accommodations/AccommodationList';

// const ProductPage = () => {
//   const navigate = useNavigate();

//   const [activeSection, setActiveSection] = useState('air');

//   const accommodationsRef = useRef(null);
//   const tourTicketRef = useRef(null);

//   const scrollToSection = section => {
//     switch (section) {
//       case 'accommodations':
//         accommodationsRef.current?.scrollIntoView({behavior: 'smooth'});
//         break;
//       case 'tourTicket':
//         tourTicketRef.current?.scrollIntoView({behavior: 'smooth'});
//         break;
//       default:
//         break;
//     }
//   };

//   return (
//     <div style={{display: 'flex'}}>
//       <Sidebar onSelectCategory={scrollToSection} />

//       <div style={{padding: '20px', flex: 1}}>
//         {/* 각 관리자용 상품 관리 컴포넌트 표시 */}
//         <div
//           id="accommodations-section"
//           ref={accommodationsRef}
//           style={{border: '1px solid #ddd', padding: '15px', marginBottom: '20px'}}>
//           <h2>🏨 숙소 상품</h2>
//           <AccommodationList />
//         </div>
//         <div id="tourTicket-section" ref={tourTicketRef} style={sectionStyle}>
//           <div style={headerContainerStyle}></div>
//           {/* <h2>🎟 투어 & 티켓 상품</h2> */}
//           <button
//             onClick={() => navigate('/product/tourTicket/list')}
//             style={plusButtonStyle}>
//             +
//           </button>
//           <TourTicketList />
//         </div>
//       </div>
//     </div>
//   );
// };

// const sectionStyle = {
//   border: '1px solid #ddd',
//   padding: '20px',
//   marginBottom: '20px',
//   position: 'relative', // 내부 요소 정렬을 위해 relative 적용
//   borderRadius: '8px',
//   backgroundColor: '#f9f9f9'
// };

// const headerContainerStyle = {
//   display: 'flex',
//   justifyContent: 'space-between', // 제목과 버튼을 양쪽으로 정렬
//   alignItems: 'center',
//   position: 'relative' // + 버튼이 제목과 함께 배치되도록 함
// };

// const plusButtonStyle = {
//   position: 'absolute',
//   top: '10px',
//   right: '10px', // 상품 박스 내부에서 우측 상단으로 배치
//   fontSize: '20px',
//   fontWeight: 'bold',
//   cursor: 'pointer',
//   backgroundColor: '#007bff',
//   color: '#fff',
//   border: 'none',
//   borderRadius: '50%',
//   width: '30px',
//   height: '30px',
//   textAlign: 'center',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' // 그림자 효과 추가
// };

export default ProductPage;
