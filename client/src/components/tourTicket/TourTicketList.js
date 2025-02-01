// import React from 'react';
// import {useNavigate} from 'react-router-dom';
// import './styles/TourTicketList.css';

// const TourTicketList = ({tickets, isAdmin}) => {
//   const navigate = useNavigate();

//   return (
//     <div className="tour-ticket-container">
//       <h1>{isAdmin ? '관리자 상품 목록' : '투어 & 티켓 상품 목록'}</h1>

//       {isAdmin && (
//         <button
//           className="add-ticket-button"
//           onClick={() => navigate('/product/tourTicket/new')}>
//           상품 등록
//         </button>
//       )}

//       <div className="tour-ticket-grid">
//         {tickets.length > 0 ? (
//           tickets.map(ticket => (
//             <div
//               key={ticket._id}
//               className="tour-ticket-card"
//               onClick={() =>
//                 navigate(
//                   isAdmin
//                     ? `/product/tourTicket/list/${ticket._id}`
//                     : `/tourTicket/list/${ticket._id}`
//                 )
//               }>
//               <img
//                 src={`http://localhost:5000${ticket.images[0]}`}
//                 alt={ticket.title}
//                 className="ticket-image"
//               />
//               <div className="ticket-info">
//                 <h3 className="ticket-title">{ticket.title}</h3>
//                 <p className="ticket-price">{ticket.price.toLocaleString()} 원</p>
//                 <p className="ticket-stock">재고: {ticket.stock} 개</p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="no-products">등록된 상품이 없습니다.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TourTicketList;

import React, {useEffect, useState} from 'react';
import {getTourTickets} from '../../api/tourTicket/tourTicketService';
import {useNavigate} from 'react-router-dom';
import './styles/TourTicketList.css';

const TourTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const data = await getTourTickets();
      setTickets(data);
    };

    fetchTickets();
  }, []);

  //   return (
  //     <div className="tour-ticket-container">
  //       <h1>투어 & 티켓 상품 목록</h1>
  //       <button
  //         className="add-ticket-button"
  //         onClick={() => navigate('/product/tourTicket/new')}>
  //         상품 등록
  //       </button>

  //       <div className="tour-ticket-grid">
  //         {tickets.length > 0 ? (
  //           tickets.map(ticket => (
  //             <div
  //               key={ticket._id}
  //               className="tour-ticket-card"
  //               onClick={() => navigate(`/product/tourTicket/list/${ticket._id}`)}>
  //               <img
  //                 src={
  //                   ticket.images.length > 0
  //                     ? `http://localhost:5000${ticket.images[0]}`
  //                     : '/default.jpg'
  //                 }
  //                 alt={ticket.title}
  //                 className="ticket-image"
  //               />
  //               <div className="ticket-info">
  //                 <h3 className="ticket-title">{ticket.title}</h3>
  //                 <p className="ticket-price">{ticket.price.toLocaleString()} 원</p>
  //                 <p className="ticket-stock">재고: {ticket.stock} 개</p>
  //               </div>
  //             </div>
  //           ))
  //         ) : (
  //           <p className="no-products">등록된 상품이 없습니다.</p>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="tour-ticket-container">
      <h1>투어 & 티켓 상품 목록</h1>
      <button
        onClick={() => navigate('/product/tourTicket/new')}
        style={{marginBottom: '20px'}}>
        상품 등록
      </button>

      <div className="tour-ticket-grid">
        {tickets.length > 0 ? (
          tickets.map(ticket => (
            <div key={ticket._id} className="tour-ticket-card">
              {/* <img
                src={ticket.images.length > 0 ? ticket.images[0] : '/default.jpg'}
                alt={ticket.title}
                className="ticket-image"
              /> */}
              <img
                src={`http://localhost:5000${ticket.images[0]}`}
                alt={ticket.title}
                className="ticket-image"
              />
              <div className="ticket-info">
                <h3 className="ticket-title">{ticket.title}</h3>
                <p className="ticket-price">{ticket.price.toLocaleString()} 원</p>
                <p className="ticket-stock">재고: {ticket.stock} 개</p>
              </div>
            </div>
          ))
        ) : (
          <p>등록된 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default TourTicketList;
