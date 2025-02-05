// 상품 카테고리 선택 사이드바

import React, {useState, useEffect} from 'react';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';

const Sidebar = ({activeSection, onSelectCategory}) => {
  const [sidebarTop, setSidebarTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // 현재 스크롤 위치에 따라 Sidebar 위치 조정
      setSidebarTop(window.scrollY > 100 ? window.scrollY - 80 : 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{position: 'absolute', top: `${sidebarTop}px`, transition: 'top 0.3s ease'}}>
      <Tab.Container id="left-tabs-example" activeKey={activeSection}>
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link
                  style={{whiteSpace: 'nowrap', textAlign: 'center'}}
                  eventKey="accommodations"
                  onClick={() => onSelectCategory('accommodations')}>
                  🏨 숙소
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  style={{whiteSpace: 'nowrap', textAlign: 'center'}}
                  eventKey="tourTicket"
                  onClick={() => onSelectCategory('tourTicket')}>
                  🎟 투어.티켓
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
};

export default Sidebar;

// import React from 'react';
// import {useNavigate} from 'react-router-dom';

// import Col from 'react-bootstrap/Col';
// import Nav from 'react-bootstrap/Nav';
// import Row from 'react-bootstrap/Row';
// import Tab from 'react-bootstrap/Tab';

// import '../styles/Sidebar.css';

// const Sidebar = ({onSelectCategory}) => {
//   return (
//     <Tab.Container id="left-tabs-example" defaultActiveKey="air">
//       <Row>
//         <Col sm={3}>
//           <Nav variant="pills" className="flex-column">
//             <Nav.Item>
//               <Nav.Link
//                 style={{whiteSpace: 'nowrap', textAlign: 'center'}}
//                 eventKey="air"
//                 onClick={() => onSelectCategory('air')}>
//                 ✈ 항공
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 style={{whiteSpace: 'nowrap', textAlign: 'center'}}
//                 eventKey="accommodations"
//                 onClick={() => onSelectCategory('accommodations')}>
//                 🏨 숙소
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 style={{whiteSpace: 'nowrap', textAlign: 'center'}}
//                 eventKey="tourTicket"
//                 onClick={() => onSelectCategory('tourTicket')}>
//                 🎟 투어.티켓
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 style={{whiteSpace: 'nowrap', textAlign: 'center'}}
//                 eventKey="travelGoods"
//                 onClick={() => onSelectCategory('travelGoods')}>
//                 🛍 여행용품
//               </Nav.Link>
//             </Nav.Item>
//           </Nav>
//         </Col>
//       </Row>
//     </Tab.Container>
//   );
// };

// export default Sidebar;
