import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getQnaBoardById, updateQnaBoard} from '../../api/qna/qnaBoardService';
import {getUserProfile} from '../../api/user/user';
import {
  Button,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  TextField,
  MenuItem,
  Typography,
  Box
} from '@mui/material';
import {Delete as DeleteIcon} from '@mui/icons-material';

const QnaBoardEdit = () => {
  const {qnaBoardId} = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    images: [],
    attachments: [],
    existingImages: [],
    existingAttachments: []
  });

  const [imagePreviews, setImagePreviews] = useState([]); // 새 이미지 미리보기
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserProfile();
        setUser(response.data);
      } catch (error) {
        setUser(null);
      }
    };

    const fetchQnaBoard = async () => {
      try {
        const data = await getQnaBoardById(qnaBoardId);
        setFormData({
          category: data.category,
          title: data.title,
          content: data.content,
          images: [],
          attachments: [],
          existingImages: data.images || [],
          existingAttachments: data.attachments || []
        });
        setLoading(false);
      } catch (error) {
        console.error('게시글 조회 오류:', error);
        setLoading(false);
      }
    };

    fetchUser();
    fetchQnaBoard();
  }, [qnaBoardId]);

  // 새 이미지 및 첨부파일 업로드 핸들러
  const handleFileChange = e => {
    const {name, files} = e.target;
    const fileArray = Array.from(files);

    if (name === 'images') {
      const previews = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previews]);
    }

    setFormData(prev => ({
      ...prev,
      [name]: [...prev[name], ...fileArray]
    }));
  };

  // 기존 이미지 삭제
  const handleRemoveExistingImage = index => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  // 기존 첨부파일 삭제
  const handleRemoveExistingFile = index => {
    setFormData(prev => ({
      ...prev,
      existingAttachments: prev.existingAttachments.filter((_, i) => i !== index)
    }));
  };

  // 게시글 수정 요청
  const handleUpdateQnaBoard = async e => {
    e.preventDefault();

    if (!user) return alert('로그인이 필요합니다.');
    if (!formData.category || !formData.title || !formData.content) {
      alert('카테고리, 제목, 내용을 입력하세요.');
      return;
    }

    setLoading(true);

    try {
      let updatedFormData = new FormData();
      updatedFormData.append('category', formData.category);
      updatedFormData.append('title', formData.title);
      updatedFormData.append('content', formData.content);

      formData.images.forEach(file => {
        if (file instanceof File) {
          updatedFormData.append('images', file);
        }
      });

      formData.attachments.forEach(file => {
        if (file instanceof File) {
          updatedFormData.append('attachments', file);
        }
      });

      updatedFormData.append('existingImages', JSON.stringify(formData.existingImages));
      updatedFormData.append(
        'existingAttachments',
        JSON.stringify(formData.existingAttachments)
      );

      await updateQnaBoard(qnaBoardId, updatedFormData, true);
      alert('게시글이 수정되었습니다.');
      navigate(`/qna/${qnaBoardId}`);
    } catch (error) {
      alert('게시글 수정 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <Box sx={{maxWidth: 600, margin: 'auto', mt: 4}}>
      <Typography variant="h4">게시글 수정</Typography>
      <form onSubmit={handleUpdateQnaBoard} encType="multipart/form-data">
        <TextField
          select
          label="카테고리"
          name="category"
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
          fullWidth
          required
          margin="normal">
          {categories.map((category, index) => (
            <MenuItem key={index} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="제목"
          name="title"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          fullWidth
          required
          margin="normal"
        />

        <TextField
          label="내용"
          name="content"
          multiline
          rows={4}
          value={formData.content}
          onChange={e => setFormData({...formData, content: e.target.value})}
          fullWidth
          required
          margin="normal"
        />

        {/* 기존 이미지 목록 */}
        {formData.existingImages.length > 0 && (
          <Box>
            <Typography variant="h6">현재 업로드된 이미지</Typography>
            {formData.existingImages.map((img, index) => (
              <Card key={index} sx={{maxWidth: 120, display: 'inline-block', margin: 1}}>
                <CardMedia
                  component="img"
                  height="80"
                  image={`http://localhost:5000${img}`}
                  alt="기존 이미지"
                />
                <CardActions>
                  <IconButton
                    onClick={() => handleRemoveExistingImage(index)}
                    color="error">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        <Button variant="contained" component="label" sx={{mt: 2}}>
          새 이미지 업로드
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>

        <Button variant="contained" component="label" sx={{mt: 2}}>
          새 첨부파일 업로드
          <input
            type="file"
            name="attachments"
            multiple
            accept=".pdf, .doc, .docx"
            hidden
            onChange={handleFileChange}
          />
        </Button>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt: 3}}>
          {loading ? '수정 중...' : '수정 완료'}
        </Button>
      </form>
    </Box>
  );
};

export default QnaBoardEdit;
