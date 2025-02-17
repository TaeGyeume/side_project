import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
  getQnaBoardById,
  deleteQnaBoard,
  getQnaComments,
  createQnaComment,
  deleteQnaComment
} from '../../api/qna/qnaBoardService';
import {getUserProfile} from '../../api/user/user'; // ✅ 사용자 정보 조회 API
import './styles/QnaBoardDetail.css'; // 스타일 파일 (별도로 생성 필요)

const QnaBoardDetail = () => {
  const {qnaBoardId} = useParams(); // ✅ 올바른 변수명 사용
  console.log('📌 QnA 게시글 ID:', qnaBoardId);

  const navigate = useNavigate();
  const [user, setUser] = useState(null); // ✅ 인증된 사용자 정보
  const [qnaBoard, setQnaBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  // ✅ 현재 로그인한 사용자 정보를 가져오기
  const fetchUser = async () => {
    try {
      console.log('🚀 사용자 정보 요청 시작');
      const response = await getUserProfile(); // ✅ 기존 axios 요청을 getUserProfile()로 변경
      console.log('✅ 사용자 정보 응답:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('❌ 사용자 정보를 가져오는 중 오류 발생:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const fetchQnaBoard = async () => {
      try {
        const data = await getQnaBoardById(qnaBoardId);
        setQnaBoard(data);
      } catch (error) {
        console.error('QnA 게시글 조회 오류:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await getQnaComments(qnaBoardId);
        console.log('📥 댓글 데이터:', response.comments); // ✅ 댓글 데이터 확인
        setComments(response.comments);
      } catch (error) {
        console.error('QnA 댓글 조회 오류:', error);
      }
    };

    fetchUser(); // ✅ 사용자 정보 가져오기
    fetchQnaBoard();
    fetchComments();
    setLoading(false);
  }, [qnaBoardId]);

  // ✅ QnA 게시글 삭제
  const handleDeleteQnaBoard = async () => {
    if (!user) return alert('로그인이 필요합니다.');
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        await deleteQnaBoard(qnaBoardId); // ✅ ID 수정
        alert('게시글이 삭제되었습니다.');
        navigate('/qna'); // 삭제 후 목록으로 이동
      } catch (error) {
        console.error('QnA 게시글 삭제 오류:', error);
      }
    }
  };

  // ✅ 댓글 작성
  const handleCreateComment = async () => {
    if (!user) return alert('로그인이 필요합니다.');
    if (!newComment.trim()) return alert('댓글을 입력하세요.');

    setCommentLoading(true);
    try {
      const comment = await createQnaComment(qnaBoardId, newComment); // ✅ ID 수정
      setComments([comment, ...comments]); // 최신 댓글이 위로 가도록 추가
      setNewComment('');
    } catch (error) {
      console.error('QnA 댓글 작성 오류:', error);
    }
    setCommentLoading(false);
  };

  // ✅ 댓글 삭제
  const handleDeleteComment = async commentId => {
    if (!user) return alert('로그인이 필요합니다.');
    if (window.confirm('정말로 댓글을 삭제하시겠습니까?')) {
      try {
        await deleteQnaComment(commentId);
        setComments(comments.filter(comment => comment._id !== commentId));
      } catch (error) {
        console.error('QnA 댓글 삭제 오류:', error);
      }
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!qnaBoard) return <p>게시글을 찾을 수 없습니다.</p>;

  return (
    <div className="qna-detail-container">
      <h1>{qnaBoard.title}</h1>
      <p>카테고리: {qnaBoard.category}</p>
      <p>작성자: {qnaBoard.user?.name || '익명'}</p>
      <p>작성일: {new Date(qnaBoard.createdAt).toLocaleString()}</p>
      <p>{qnaBoard.content}</p>

      {/* 이미지 & 파일 첨부 */}
      {qnaBoard.images.length > 0 && (
        <div className="qna-images">
          {qnaBoard.images.map((img, index) => (
            <img key={index} src={`http://localhost:5000${img}`} alt="첨부 이미지" />
          ))}
        </div>
      )}

      {qnaBoard.attachments.length > 0 && (
        <div className="qna-attachments">
          {qnaBoard.attachments.map((file, index) => (
            <a key={index} href={`http://localhost:5000${file}`} download>
              첨부파일 {index + 1}
            </a>
          ))}
        </div>
      )}

      {/* 관리자 또는 작성자만 삭제 가능 */}
      {user && (user?.id === qnaBoard.user._id || user?.roles.includes('admin')) && (
        <button onClick={handleDeleteQnaBoard} className="delete-button">
          게시글 삭제
        </button>
      )}

      {/* 🔹 댓글 목록 */}
      <div className="qna-comments">
        <h3>댓글 ({comments.length})</h3>
        {comments.map(comment => (
          <div key={comment._id} className="qna-comment">
            <p>
              <strong>{comment.user?.name || '알 수 없음'}</strong>{' '}
              {comment.isAdmin && <span>(관리자)</span>}
            </p>
            <p>{comment.content}</p>
            <p className="comment-date">{new Date(comment.createdAt).toLocaleString()}</p>
            {user &&
              (user?.id === comment.user?._id || user?.roles.includes('admin')) && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="delete-comment">
                  삭제
                </button>
              )}
          </div>
        ))}
      </div>

      {/* 🔹 댓글 작성 */}
      <div className="comment-input">
        <textarea
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button onClick={handleCreateComment} disabled={commentLoading}>
          {commentLoading ? '작성 중...' : '댓글 작성'}
        </button>
      </div>
    </div>
  );
};

export default QnaBoardDetail;
