import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../../../api/axios';

const TravelItemForm = ({onItemCreated}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]); // 모든 카테고리
  const [topCategories, setTopCategories] = useState([]); // 최상위 카테고리
  const [subCategories, setSubCategories] = useState([]); // 선택한 최상위 카테고리의 하위 카테고리
  const [previewImages, setPreviewImages] = useState([]); // ✅ 이미지 미리보기 목록
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topCategory: '',
    category: '',
    parentCategory: '',
    price: '',
    stock: '',
    images: []
  });

  // ✅ 모든 카테고리 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/travelItems/allCategories');
        setCategories(response.data.categories || []);

        // 최상위 카테고리만 필터링
        setTopCategories(response.data.categories.filter(cat => !cat.parentCategory));
      } catch (error) {
        console.error('❌ 카테고리 불러오기 실패:', error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ 최상위 카테고리 변경 시, 하위 카테고리 필터링
  const handleTopCategoryChange = e => {
    const selectedTopCategory = e.target.value;
    setFormData({
      ...formData,
      topCategory: selectedTopCategory,
      category: '',
      parentCategory: ''
    });

    // ✅ 하위 카테고리 필터링 (상품 제외)
    if (selectedTopCategory) {
      setSubCategories(
        categories.filter(cat => cat.parentCategory?._id === selectedTopCategory)
      );
    } else {
      setSubCategories([]);
    }
  };

  // ✅ 하위 카테고리 선택 시, parentCategory 설정
  const handleChange = e => {
    const {name, value} = e.target;

    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        parentCategory: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // ✅ 이미지 업로드 핸들러 (미리보기 추가)
  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: files
    });

    // ✅ 미리보기 이미지 생성
    const filePreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(filePreviews);
  };

  // ✅ 개별 이미지 삭제 핸들러
  const handleRemoveImage = index => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({...formData, images: newImages});

    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
  };

  // ✅ 전체 이미지 초기화 핸들러
  const handleClearImages = () => {
    setFormData({...formData, images: []});
    setPreviewImages([]);
  };

  // ✅ 상품 등록 요청
  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();

    for (const key in formData) {
      if (key === 'images') {
        formData.images.forEach(file => data.append('images', file));
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post('/travelItems/create', data, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      console.log('✅ 상품 등록 성공');
      setFormData({
        name: '',
        description: '',
        topCategory: '',
        category: '',
        parentCategory: '',
        price: '',
        stock: '',
        images: []
      });
      setPreviewImages([]); // ✅ 미리보기 초기화
      navigate('/product/travelItem/list');
      onItemCreated();
    } catch (error) {
      console.error('❌ 상품 등록 실패:', error);
    }
  };

  // ✅ 취소 버튼 클릭 시 상품 리스트 페이지로 이동
  const handleCancel = () => {
    navigate('/product/travelItems/list');
  };

  return (
    <div className="container mt-3">
      <h3>🛍️ 여행용품 등록</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">상품명</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">설명</label>
          <textarea
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* ✅ 최상위 카테고리 선택 */}
        <div className="mb-3">
          <label className="form-label">최상위 카테고리</label>
          <select
            className="form-select"
            name="topCategory"
            value={formData.topCategory}
            onChange={handleTopCategoryChange}
            required>
            <option value="">최상위 카테고리 선택</option>
            {topCategories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ 하위 카테고리 선택 */}
        {subCategories.length > 0 && (
          <div className="mb-3">
            <label className="form-label">하위 카테고리</label>
            <select
              className="form-select"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required>
              <option value="">하위 카테고리 선택</option>
              {subCategories.map(subCat => (
                <option key={subCat._id} value={subCat._id}>
                  {subCat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">가격 (₩)</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">재고</label>
          <input
            type="number"
            className="form-control"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>

        {/* ✅ 이미지 업로드 */}
        <div className="mb-3">
          <label className="form-label">이미지 업로드</label>
          <input
            type="file"
            className="form-control"
            name="images"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* ✅ 이미지 미리보기 및 삭제 */}
        {previewImages.length > 0 && (
          <div className="mb-3">
            <label className="form-label">이미지 미리보기</label>
            <div className="d-flex flex-wrap gap-2">
              {previewImages.map((img, index) => (
                <div key={index} className="position-relative">
                  <img
                    src={img}
                    alt={`미리보기-${index}`}
                    className="img-thumbnail"
                    width="100"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                    onClick={() => handleRemoveImage(index)}>
                    ❌
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-warning mt-2"
              onClick={handleClearImages}>
              모든 이미지 삭제
            </button>
          </div>
        )}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            상품 등록
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelItemForm;
