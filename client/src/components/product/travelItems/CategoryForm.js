import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  fetchTopCategories,
  createCategory
} from '../../../api/travelItem/travelItemService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';

const CategoryForm = ({onCategoryCreated}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]); // 최상위 카테고리 목록
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    parentCategory: null
  });

  // 최상위 카테고리 불러오기
  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchTopCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  // 입력값 변경 핸들러 (기능 그대로 유지)
  const handleChange = e => {
    const {name, value} = e.target;

    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        parentCategory: value // 기존 로직 유지
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 카테고리 등록 요청 (기능 그대로 유지)
  const handleSubmit = async e => {
    e.preventDefault();

    try {
      // 기존 카테고리 목록 가져오기
      const existingCategories = await fetchTopCategories();

      // 최상위 카테고리 중복 확인
      if (!formData.parentCategory) {
        const isDuplicate = existingCategories.some(cat => cat.name === formData.name);
        if (isDuplicate) {
          alert('이미 존재하는 최상위 카테고리입니다.');
          return;
        }
      } else {
        // 하위 카테고리 중복 확인 (같은 부모 카테고리 내)
        const parentCategory = existingCategories.find(
          cat => cat._id === formData.parentCategory
        );

        if (parentCategory) {
          const isDuplicate = parentCategory.subCategories.some(
            subCat => subCat.name === formData.name
          );
          if (isDuplicate) {
            alert('해당 부모 카테고리 내에서 중복된 이름이 존재합니다.');
            return;
          }
        }
      }

      // 중복이 없으면 카테고리 생성 요청
      const categoryData = {...formData, category: formData.name};
      await createCategory(categoryData);
      alert('카테고리가 추가되었습니다.');

      // 입력 폼 초기화
      setFormData({name: '', category: '', parentCategory: null});

      onCategoryCreated();
      navigate('/product/travelItems/list');
    } catch (error) {
      console.error('카테고리 등록 실패:', error);
    }
  };

  // 취소 버튼 클릭 시 상품 리스트 페이지로 이동 (기능 그대로 유지)
  const handleCancel = () => {
    navigate('/product/travelItems/list');
  };

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: 'auto',
        mt: 4
      }}>
      <Card sx={{p: 2, borderRadius: 2, boxShadow: 3}}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📂 카테고리 추가
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* 카테고리명 입력 */}
            <FormControl fullWidth sx={{mb: 2}}>
              <TextField
                label="카테고리명"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </FormControl>

            {/* 부모 카테고리 선택 */}
            <FormControl fullWidth sx={{mb: 3}}>
              <InputLabel shrink>부모 카테고리 (선택)</InputLabel>
              <Select
                name="parentCategory"
                value={formData.parentCategory || ''}
                onChange={handleChange}
                displayEmpty
                variant="outlined"
                label="부모 카테고리 (선택)" // Select에 label 추가
              >
                <MenuItem value="">최상위 카테고리</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 버튼 그룹 */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button type="submit" variant="contained" color="primary">
                카테고리 추가
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                취소
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CategoryForm;
