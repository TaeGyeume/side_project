import React, {useEffect, useState} from 'react';
import {getQnaBoards, deleteQnaBoard} from '../../api/qna/qnaBoardService';
import {useNavigate} from 'react-router-dom';
import {getUserProfile} from '../../api/user/user';
import './styles/QnaBoardList.css';

const QnaBoardList = () => {
  const [qnaBoards, setQnaBoards] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndBoards = async () => {
      try {
        setLoading(true);

        // ✅ 사용자 정보 가져오기
        const userResponse = await getUserProfile();
        setUser(userResponse.data);

        // ✅ QnA 게시글 목록 가져오기 (페이징 및 카테고리 필터링을 함께 처리)
        const response = await getQnaBoards(page, category);
        setQnaBoards(response.qnaBoards);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error('❌ 데이터 로드 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBoards();
  }, [page, category]); // page나 category가 바뀔 때마다 API 호출

  // 게시글 삭제 처리
  const handleDeleteQnaBoard = async qnaBoardId => {
    if (!user) return alert('로그인이 필요합니다.');

    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        // QnA 게시글 삭제 요청
        await deleteQnaBoard(qnaBoardId);

        // 삭제된 게시글을 목록에서 즉시 제외하여 UI 갱신
        setQnaBoards(prevBoards => prevBoards.filter(qna => qna._id !== qnaBoardId));
        alert('게시글이 삭제되었습니다.');
      } catch (error) {
        console.error('❌ 게시글 삭제 오류:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEditQnaBoard = qnaBoardId => {
    navigate(`/qna/edit/${qnaBoardId}`);
  };

  return (
    <div className="qna-board-container">
      <h1>고객 문의</h1>

      {user && (
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
                onClick={() => navigate(`/qna/${qna._id}`)} // 게시글 상세보기로 이동
              >
                <h3>{qna.title}</h3>
                <p>{qna.category}</p>

                {/* 🔹 작성자 정보 표시 (이름 우선, 없으면 아이디) */}
                <p>
                  작성자: <strong>{qna.user?.username || '익명'}</strong>
                </p>
                <p>
                  이메일: <strong>{qna.user?.email || '알 수 없음'}</strong>
                </p>

                <p>작성일: {new Date(qna.createdAt).toLocaleDateString()}</p>

                {/* 🔹 수정 및 삭제 버튼 (현재 사용자만 수정, 관리자는 삭제 가능) */}
                {user && (user._id === qna.user?._id || user.roles.includes('admin')) && (
                  <div className="qna-board-actions">
                    {user._id === qna.user?._id && (
                      <button
                        onClick={e => {
                          e.stopPropagation(); // 클릭 시 상세 페이지 이동을 방지하고 수정으로만 이동
                          handleEditQnaBoard(qna._id);
                        }}
                        className="edit-button">
                        수정
                      </button>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation(); // 클릭 시 상세 페이지 이동을 방지하고 삭제로만 이동
                        handleDeleteQnaBoard(qna._id);
                      }}
                      className="delete-button">
                      삭제
                    </button>
                  </div>
                )}
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
