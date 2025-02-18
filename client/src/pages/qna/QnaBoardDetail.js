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
  const {qnaBoardId} = useParams();
  console.log('📌 QnA 게시글 ID:', qnaBoardId);

  const navigate = useNavigate();
  const [user, setUser] = useState(null); // ✅ 현재 로그인한 사용자 정보
  const [qnaBoard, setQnaBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  // ✅ 현재 로그인한 사용자 정보를 가져오기
  const fetchUser = async () => {
    try {
      // console.log('🚀 사용자 정보 요청 시작');
      const response = await getUserProfile();
      // console.log('✅ 사용자 정보 응답:', response.data);
      setUser(response.data);
    } catch (error) {
      // console.error('❌ 사용자 정보를 가져오는 중 오류 발생:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const fetchQnaBoard = async () => {
      try {
        const data = await getQnaBoardById(qnaBoardId);
        console.log('📥 QnA 게시글 데이터:', data);
        setQnaBoard(data);
      } catch (error) {
        console.error('QnA 게시글 조회 오류:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await getQnaComments(qnaBoardId);
        // console.log('📥 댓글 데이터:', response.comments);
        setComments(response.comments);
      } catch (error) {
        // console.error('QnA 댓글 조회 오류:', error);
      }
    };

    fetchUser();
    fetchQnaBoard();
    fetchComments();
    setLoading(false);
  }, [qnaBoardId]);

  // ✅ QnA 게시글 삭제
  const handleDeleteQnaBoard = async () => {
    if (!user) return alert('로그인이 필요합니다.');

    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        console.log('🛠 게시글 삭제 요청:', {
          boardId: qnaBoardId,
          userId: user._id, // 현재 로그인한 사용자 ID
          roles: user.roles // 현재 사용자 역할
        });

        await deleteQnaBoard(qnaBoardId, user._id);
        alert('게시글이 삭제되었습니다.');
        navigate('/qna'); // 목록으로 이동
      } catch (error) {
        console.error('❌ QnA 게시글 삭제 오류:', error);
        alert('게시글 삭제 중 오류 발생');
      }
    }
  };

  //  댓글 작성
  const handleCreateComment = async () => {
    if (!user) return alert('로그인이 필요합니다.');
    if (!newComment.trim()) return alert('댓글을 입력하세요.');

    setCommentLoading(true);
    try {
      const response = await createQnaComment(qnaBoardId, newComment);

      //  새 댓글을 기존 목록에 추가하여 즉시 반영
      setComments(prevComments => [
        {
          ...response.qnaComment,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email
          }
        },
        ...prevComments
      ]);

      setNewComment('');
    } catch (error) {
      // console.error('❌ QnA 댓글 작성 오류:', error);
    }
    setCommentLoading(false);
  };

  // 댓글 삭제
  const handleDeleteComment = async commentId => {
    if (!user) return alert('로그인이 필요합니다.');

    // console.log('🛠 댓글 삭제 요청:', {commentId, userId: user._id, roles: user.roles});

    if (window.confirm('정말로 댓글을 삭제하시겠습니까?')) {
      try {
        await deleteQnaComment(commentId, user._id, user.roles);
        setComments(prevComments =>
          prevComments.filter(comment => comment._id !== commentId)
        );
      } catch (error) {
        // console.error('❌ QnA 댓글 삭제 오류:', error);
        alert('댓글 삭제 중 오류 발생');
      }
    }
  };

  if (loading) return <p>로딩 중...</p>;

  if (!qnaBoard) return <p>게시글을 찾을 수 없습니다.</p>;

  return (
    <div className="qna-detail-container">
      <h1>{qnaBoard.title}</h1>
      <p>카테고리: {qnaBoard.category}</p>
      {/* 작성자: 이름 우선, 없으면 이메일 표시 */}
      <p>
        작성자: <strong>{qnaBoard.user?.username || '익명'}</strong>
        {qnaBoard.user?.email && ` (${qnaBoard.user.email})`}
      </p>
      <p>
        작성일:{' '}
        {qnaBoard.createdAt
          ? new Date(qnaBoard.createdAt).toLocaleString()
          : '알 수 없음'}
      </p>
      <p>{qnaBoard.content}</p>

      {/* 이미지 & 파일 첨부 */}
      {qnaBoard.images && qnaBoard.images.length > 0 && (
        <div className="qna-images">
          {qnaBoard.images.map((img, index) => (
            <img key={index} src={`http://localhost:5000${img}`} alt="첨부 이미지" />
          ))}
        </div>
      )}

      {qnaBoard.attachments && qnaBoard.attachments.length > 0 && (
        <div className="qna-attachments">
          {qnaBoard.attachments.map((file, index) => (
            <a key={index} href={`http://localhost:5000${file}`} download>
              첨부파일 {index + 1}
            </a>
          ))}
        </div>
      )}

      {/* 관리자 또는 작성자만 삭제 가능 */}
      {user && (user.id === qnaBoard.user?._id || user.roles?.includes('admin')) && (
        <button onClick={handleDeleteQnaBoard} className="delete-button">
          게시글 삭제
        </button>
      )}

      {/* 🔹 댓글 목록 */}
      <div className="qna-comments">
        <h3>댓글 ({comments.length})</h3>
        {comments.map(comment => (
          <div key={comment._id || Math.random()} className="qna-comment">
            <p>
              <strong>
                {comment.user?.username || comment.user?.email || '알 수 없음'}
              </strong>
              {comment.isAdmin && <span>(관리자)</span>}
            </p>
            <p>{comment.content}</p>
            <p className="comment-date">
              {comment.createdAt
                ? new Date(comment.createdAt).toLocaleString()
                : '날짜 없음'}
            </p>
            {user &&
              (user._id === comment.user?._id || user.roles?.includes('admin')) && (
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
