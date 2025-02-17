import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {createQnaBoard} from '../../api/qna/qnaBoardService';
import './styles/QnaBoardWrite.css';

const QnaBoardWrite = () => {
  const navigate = useNavigate();

  // ✅ 폼 상태 관리
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    images: [],
    attachments: []
  });

  const [loading, setLoading] = useState(false);

  // ✅ 카테고리 옵션
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

  // ✅ 입력 변경 핸들러
  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // ✅ 파일 업로드 핸들러
  const handleFileChange = e => {
    const {name, files} = e.target;
    setFormData({...formData, [name]: files});
  };

  // ✅ 게시글 제출 핸들러
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.category || !formData.title || !formData.content) {
      alert('카테고리, 제목, 내용을 입력하세요.');
      return;
    }

    const form = new FormData();
    form.append('category', formData.category);
    form.append('title', formData.title);
    form.append('content', formData.content);

    // ✅ 이미지 & 첨부파일 추가
    if (formData.images.length > 0) {
      Array.from(formData.images).forEach(file => form.append('images', file));
    }
    if (formData.attachments.length > 0) {
      Array.from(formData.attachments).forEach(file => form.append('attachments', file));
    }

    setLoading(true);
    try {
      await createQnaBoard(form);
      alert('게시글이 작성되었습니다.');
      navigate('/qna'); // ✅ 목록으로 이동
    } catch (error) {
      console.error('❌ QnA 게시글 작성 오류:', error);
      alert('게시글 작성에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="qna-write-container">
      <h2>QnA 게시글 작성</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* 카테고리 선택 */}
        <label>카테고리</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
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
          onChange={handleChange}
          required
        />

        {/* 내용 입력 */}
        <label>내용</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          required></textarea>

        {/* 이미지 업로드 */}
        <label>이미지 업로드 (최대 3개)</label>
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* 첨부파일 업로드 */}
        <label>첨부파일 업로드 (PDF, DOCX 등)</label>
        <input
          type="file"
          name="attachments"
          multiple
          accept=".pdf, .doc, .docx"
          onChange={handleFileChange}
        />

        {/* 제출 버튼 */}
        <button type="submit" disabled={loading}>
          {loading ? '작성 중...' : '게시글 작성'}
        </button>
      </form>
    </div>
  );
};

export default QnaBoardWrite;
