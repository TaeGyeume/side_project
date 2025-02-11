import React, {useEffect, useState} from 'react';
import {
  getTourTickets,
  deleteMultipleTourTickets
} from '../../../api/tourTicket/tourTicketService';
import {useLocation, useNavigate} from 'react-router-dom';
import '../tourTicket/styles/TourTicketList.css';

const TourTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false); // 삭제 모드 여부
  const [selectedTickets, setSelectedTickets] = useState(new Set()); // 선택된 티켓 ID

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getTourTickets();

        const sortedTickets = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTickets(data);
      } catch (error) {
        console.error('투어 티켓 목록을 가져오는 중 오류 발생:', error);
      }
    };

    fetchTickets();
  }, []);

  // 삭제 모드 토글
  const toggleDeleteMode = () => {
    setIsDeleteMode(prev => !prev);
    setSelectedTickets(new Set()); // 선택 초기화
  };

  // 품 선택 / 해제
  const handleSelectTicket = ticketId => {
    setSelectedTickets(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(ticketId)) {
        newSelection.delete(ticketId);
      } else {
        newSelection.add(ticketId);
      }
      return newSelection;
    });
  };

  // 선택한 상품 삭제
  const handleDelete = async () => {
    if (selectedTickets.size === 0) {
      alert('삭제할 상품을 선택하세요.');
      return;
    }

    const confirmDelete = window.confirm(
      `${selectedTickets.size}개의 상품을 삭제하시겠습니까?`
    );

    if (!confirmDelete) return;

    try {
      await deleteMultipleTourTickets([...selectedTickets]);
      alert('삭제가 완료되었습니다.');

      // 삭제 후 목록 갱신
      setTickets(prev => prev.filter(ticket => !selectedTickets.has(ticket._id)));
      setSelectedTickets(new Set()); // 선택 초기화
      setIsDeleteMode(false); // 삭제 모드 해제
    } catch (error) {
      console.error('상품 삭제 중 오류 발생:', error);
      alert('상품 삭제 실패');
    }
  };

  return (
    <div className="tour-ticket-container">
      <h2>🎟 투어 & 티켓 상품</h2>

      {/* /product/tourTicket에서는 버튼을 숨김 */}
      {location.pathname !== '/product' && (
        <div className="button-group">
          <button onClick={() => navigate('/product/tourTicket/new')}>상품 등록</button>
          {!isDeleteMode ? (
            <button onClick={toggleDeleteMode} className="delete-mode-btn">
              삭제 모드
            </button>
          ) : (
            <>
              <button onClick={handleDelete} className="confirm-delete-btn">
                삭제하기
              </button>
              <button onClick={toggleDeleteMode} className="cancel-delete-btn">
                삭제 취소
              </button>
            </>
          )}
        </div>
      )}

      <div className="tour-ticket-grid">
        {tickets.length > 0 ? (
          tickets.map(ticket => (
            <div
              key={ticket._id}
              className={`tour-ticket-card ${
                selectedTickets.has(ticket._id) ? 'selected' : ''
              }`}
              onClick={() =>
                isDeleteMode
                  ? handleSelectTicket(ticket._id)
                  : navigate(`/product/tourTicket/${ticket._id}`)
              }>
              {isDeleteMode && (
                <input
                  type="checkbox"
                  className="ticket-checkbox"
                  checked={selectedTickets.has(ticket._id)}
                  onChange={() => handleSelectTicket(ticket._id)}
                  onClick={e => e.stopPropagation()} // 카드 클릭 방지
                />
              )}
              <img
                src={`http://localhost:5000${ticket.images[0]}`}
                alt={ticket.title}
                className="ticket-image"
              />
              <div className="ticket-info">
                <h3 className="ticket-title">{ticket.title}</h3>
                <p className="ticket-description">✏️| {ticket.description}</p>
                <p className="ticket-location">지역: {ticket.location}</p>
                <p className="ticket-price">{ticket.price.toLocaleString()}원</p>
                <p className="ticket-stock">재고: {ticket.stock}개</p>
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
