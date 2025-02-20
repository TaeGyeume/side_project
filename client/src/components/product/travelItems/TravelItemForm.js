import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  fetchAllCategories,
  fetchTravelItem,
  createTravelItem,
  updateTravelItem
} from '../../../api/travelItem/travelItemService';

const TravelItemForm = ({isEdit = false, itemId = null, onItemCreated = () => {}}) => {
  // isEdit과 itemId를 props에서 받음
  const navigate = useNavigate();
  const {itemId: paramItemId} = useParams(); // URL에서 itemId 가져오기 (수정 모드)

  const finalItemId = itemId || paramItemId; // props에서 받은 itemId가 없으면 useParams 사용

  const [categories, setCategories] = useState([]); // 모든 카테고리
  const [topCategories, setTopCategories] = useState([]); // 최상위 카테고리
  const [subCategories, setSubCategories] = useState([]); // 선택한 최상위 카테고리의 하위 카테고리
  const [previewImages, setPreviewImages] = useState([]); // 기존 이미지 미리보기
  const [newImages, setNewImages] = useState([]); // 새로 업로드된 이미지
  const [removeImages, setRemoveImages] = useState([]); // 삭제할 기존 이미지 목록

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

  const SERVER_URL = 'http://localhost:5000';

  // 모든 카테고리 불러오기
  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchAllCategories();
      setCategories(data);
      setTopCategories(data.filter(cat => !cat.parentCategory));
    };

    loadCategories();
  }, []);

  // 수정 모드일 경우 기존 상품 데이터 불러오기
  useEffect(() => {
    if (isEdit && finalItemId) {
      const fetchItem = async () => {
        try {
          const response = await fetchTravelItem(finalItemId);
          const itemData = response.data;

          // 최상위 카테고리 & 하위 카테고리 설정
          let topCategoryId = '';
          let parentCategoryId = '';

          if (itemData.parentCategory) {
            parentCategoryId = itemData.parentCategory._id;
            if (itemData.parentCategory.parentCategory) {
              topCategoryId = itemData.parentCategory.parentCategory._id;
            } else {
              topCategoryId = itemData.parentCategory._id; // 상위 카테고리가 없으면 자신이 최상위
            }
          }

          setFormData({
            name: itemData.name,
            description: itemData.description,
            topCategory: topCategoryId, // 최상위 카테고리 자동 설정
            category: parentCategoryId, // 직접적인 부모 카테고리
            parentCategory: parentCategoryId,
            price: itemData.price,
            stock: itemData.stock,
            images: itemData.images || []
          });

          setPreviewImages(itemData.images.map(img => `${SERVER_URL}${img}`));

          if (topCategoryId) {
            setSubCategories(
              categories.filter(cat => cat.parentCategory?._id === topCategoryId)
            );
          }
        } catch (error) {
          console.error('기존 상품 불러오기 실패:', error);
        }
      };

      fetchItem();
    }
  }, [isEdit, finalItemId, categories]);

  // 최상위 카테고리 변경 시, 하위 카테고리 필터링
  const handleTopCategoryChange = e => {
    const selectedTopCategory = e.target.value;
    setFormData({
      ...formData,
      topCategory: selectedTopCategory,
      category: '',
      parentCategory: ''
    });

    if (selectedTopCategory) {
      setSubCategories(
        categories.filter(cat => cat.parentCategory?._id === selectedTopCategory)
      );
    } else {
      setSubCategories([]);
    }
  };

  // 하위 카테고리 선택 시, parentCategory 설정
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

  // 이미지 업로드 핸들러
  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    setNewImages(files);

    const filePreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...filePreviews]);
  };

  // 기존 및 새 이미지 삭제 핸들러
  const handleRemoveImage = index => {
    if (index < formData.images.length) {
      const removedImage = formData.images[index];
      setRemoveImages(prev => [...prev, removedImage]); // 삭제할 기존 이미지 추가
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index) // formData.images에서 삭제
      }));
    } else {
      // 새로 추가된 이미지 삭제
      const newImageIndex = index - formData.images.length;
      setNewImages(prev => prev.filter((_, i) => i !== newImageIndex));
    }

    // 미리보기 이미지에서도 삭제
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // 상품 등록 / 수정 요청
  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();

    for (const key in formData) {
      if (key === 'images') {
        newImages.forEach(file => data.append('images', file));
      } else {
        data.append(key, formData[key]);
      }
    }

    if (removeImages.length > 0) {
      data.append('removeImages', JSON.stringify(removeImages));
    }

    try {
      if (isEdit) {
        await updateTravelItem(finalItemId, data);
        console.log('상품 수정 성공');
      } else {
        await createTravelItem(data);
        console.log('상품 등록 성공');
      }

      navigate('/product/travelItems/list');

      if (onItemCreated) {
        onItemCreated(); // 함수가 있을 경우에만 실행
      }
    } catch (error) {
      console.error('상품 처리 실패:', error);
    }
  };

  // 취소 버튼 클릭 시 상품 리스트 페이지로 이동
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

        {/* 최상위 카테고리 선택 */}
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

        {/* 하위 카테고리 선택 */}
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

        {/* 이미지 업로드 */}
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

        {/* 기존 이미지 미리보기 */}
        {previewImages.length > 0 && (
          <div className="mb-3">
            <label className="form-label">기존 이미지</label>
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
