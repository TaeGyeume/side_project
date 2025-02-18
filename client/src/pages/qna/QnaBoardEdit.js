import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getQnaBoardById, updateQnaBoard} from '../../api/qna/qnaBoardService'; // updateQnaBoard API 호출
import {getUserProfile} from '../../api/user/user'; // 사용자 정보 조회
import './styles/QnaBoardWrite.css'; // 스타일을 동일하게 사용

const QnaBoardEdit = () => {
  const {qnaBoardId} = useParams(); // 게시글 ID를 URL에서 가져옵니다.
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // 사용자 정보 상태
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    images: [],
    attachments: []
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    '회원 정보 문의',
    '회원 가입 문의',
    '여행 상품 문의',
    '항공 문의',
    '투어/티켓 문의',
    '숙소 문의',
    '예약 문의',
    '결제 문의',
    '취소/환불 문의',
    '기타 문의'
  ];

  // 사용자 정보 가져오기
  const fetchUser = async () => {
    try {
      const response = await getUserProfile();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };

  // 기존 게시글 데이터 가져오기
  const fetchQnaBoard = async () => {
    try {
      const data = await getQnaBoardById(qnaBoardId);
      setFormData({
        category: data.category,
        title: data.title,
        content: data.content,
        images: data.images || [],
        attachments: data.attachments || []
      });
      setLoading(false);
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchQnaBoard();
  }, [qnaBoardId]);

  // 게시글 수정 처리
  const handleUpdateQnaBoard = async e => {
    e.preventDefault();

    if (!user) return alert('로그인이 필요합니다.');
    if (!formData.category || !formData.title || !formData.content) {
      alert('카테고리, 제목, 내용을 입력하세요.');
      return;
    }

    setLoading(true);

    try {
      const updatedFormData = new FormData();
      updatedFormData.append('category', formData.category);
      updatedFormData.append('title', formData.title);
      updatedFormData.append('content', formData.content);

      // 파일들 추가
      Array.from(formData.images).forEach(file => updatedFormData.append('images', file));
      Array.from(formData.attachments).forEach(file =>
        updatedFormData.append('attachments', file)
      );

      await updateQnaBoard(qnaBoardId, updatedFormData);
      alert('게시글이 수정되었습니다.');
      navigate(`/qna/${qnaBoardId}`); // 수정 후 해당 게시글 상세페이지로 이동
    } catch (error) {
      alert('게시글 수정 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="qna-write-container">
      <h2>게시글 수정</h2>
      <form onSubmit={handleUpdateQnaBoard} encType="multipart/form-data">
        {/* 카테고리 선택 */}
        <label>카테고리</label>
        <select
          name="category"
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
          required>
          <option value="">카테고리를 선택하세요</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* 제목 입력 */}
        <label>제목</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />

        {/* 내용 입력 */}
        <label>내용</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={e => setFormData({...formData, content: e.target.value})}
          required
        />

        {/* 이미지 업로드 */}
        <label>이미지 업로드 (최대 3개)</label>
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={e => setFormData({...formData, images: e.target.files})}
        />

        {/* 첨부파일 업로드 */}
        <label>첨부파일 업로드 (PDF, DOCX 등)</label>
        <input
          type="file"
          name="attachments"
          multiple
          accept=".pdf, .doc, .docx"
          onChange={e => setFormData({...formData, attachments: e.target.files})}
        />

        {/* 수정 버튼 */}
        <button type="submit" disabled={loading}>
          {loading ? '수정 중...' : '수정 완료'}
        </button>
      </form>
    </div>
  );
};

export default QnaBoardEdit;
