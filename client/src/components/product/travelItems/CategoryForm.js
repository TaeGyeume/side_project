import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../../../api/axios';

const CategoryForm = ({onCategoryCreated}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]); // 초기값을 `[]`로 설정하여 map 오류 방지
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    parentCategory: null
  });

  // ✅ 최상위 카테고리 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/travelItems/topCategories');
        console.log('✅ API 응답 데이터:', response.data); // API 응답 구조 확인

        // API 응답이 { topLevelCategories: [...] } 형태이므로 해당 필드 참조
        if (response.data && Array.isArray(response.data.topLevelCategories)) {
          setCategories(response.data.topLevelCategories);
        } else {
          setCategories([]); // 데이터가 없을 경우 빈 배열로 설정
        }
      } catch (error) {
        console.error('❌ 카테고리 불러오기 실패:', error);
        setCategories([]); // 오류 발생 시 빈 배열 설정
      }
    };
    fetchCategories();
  }, []);

  // ✅ 하위 카테고리를 선택하면 `parentCategory` 자동 설정
  const handleChange = e => {
    const {name, value} = e.target;

    if (name === 'category') {
      // 선택된 하위 카테고리 찾기

      setFormData({
        ...formData,
        [name]: value, // category 값 설정
        parentCategory: value // ✅ category 값과 동일하게 parentCategory 설정
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // ✅ 카테고리 등록 요청
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const categoryData = {...formData, category: formData.name};

      const response = await axios.post('/travelItems/create', categoryData);
      console.log('✅ 카테고리 등록 성공:', response.data);
      setFormData({name: '', category: '', parentCategory: null});
      onCategoryCreated();
      navigate('/product/travelItems/list');
    } catch (error) {
      console.error('❌ 카테고리 등록 실패:', error);
    }
  };

  // ✅ 취소 버튼 클릭 시 상품 리스트 페이지로 이동
  const handleCancel = () => {
    navigate('/product/travelItems/list');
  };

  return (
    <div className="container mt-3">
      <h3>📂 카테고리 추가</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">카테고리명</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* ✅ 부모 카테고리 선택 */}
        <div className="mb-3">
          <label className="form-label">부모 카테고리 (선택)</label>
          <select
            className="form-select"
            name="parentCategory"
            value={formData.parentCategory || ''}
            onChange={handleChange}>
            <option value="">최상위 카테고리</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ 버튼 그룹 */}
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            카테고리 추가
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
