import React, {useEffect, useState} from 'react';
import {getQnaBoards} from '../../api/qna/qnaBoardService'; // API 호출
import {useNavigate} from 'react-router-dom';
import {getUserProfile} from '../../api/user/user'; // 사용자 정보 가져오기
import './styles/QnaBoardList.css'; // 스타일 파일 (별도로 생성 필요)

const QnaBoardList = () => {
  const [qnaBoards, setQnaBoards] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null); // ✅ 사용자 정보 상태 추가

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQnaBoards = async () => {
      try {
        setLoading(true);
        const response = await getQnaBoards(page, category);
        setQnaBoards(response.qnaBoards);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('QnA 목록을 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await getUserProfile();
        setUser(response.data);
      } catch (error) {
        console.error('❌ 사용자 정보를 가져오는 중 오류 발생:', error);
      }
    };

    fetchUser(); // ✅ 사용자 정보 가져오기
    fetchQnaBoards();
  }, [page, category]);

  return (
    <div className="qna-board-container">
      <h1>고객 문의</h1>

      {/* 🔹 고객 문의 등록 버튼 (관리자가 아닐 경우에만 표시) */}
      {user && !user.roles.includes('admin') && (
        <button className="qna-create-button" onClick={() => navigate('/qna/write')}>
          ✏️ 고객 문의 등록
        </button>
      )}

      {/* 🔹 카테고리 필터 */}
      <select onChange={e => setCategory(e.target.value)} value={category}>
        <option value="">전체</option>
        <option value="회원 정보 문의">회원 정보 문의</option>
        <option value="회원 가입 문의">회원 가입 문의</option>
        <option value="여행 상품 문의">여행 상품 문의</option>
        <option value="항공 문의">항공 문의</option>
        <option value="투어/티켓 문의">투어/티켓 문의</option>
        <option value="숙소 문의">숙소 문의</option>
        <option value="예약 문의">예약 문의</option>
        <option value="결제 문의">결제 문의</option>
        <option value="취소/환불 문의">취소/환불 문의</option>
        <option value="기타 문의">기타 문의</option>
      </select>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div className="qna-board-list">
          {qnaBoards.length > 0 ? (
            qnaBoards.map(qna => (
              <div
                key={qna._id}
                className="qna-board-item"
                onClick={() => navigate(`/qna/${qna._id}`)} // 상세 페이지로 이동
              >
                <h3>{qna.title}</h3>
                <p>{qna.category}</p>
                <p>작성자: {qna.user?.name || '익명'}</p>
                <p>작성일: {new Date(qna.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>등록된 QnA가 없습니다.</p>
          )}
        </div>
      )}

      {/* 🔹 페이징 버튼 */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          이전
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          다음
        </button>
      </div>
    </div>
  );
};

export default QnaBoardList;
