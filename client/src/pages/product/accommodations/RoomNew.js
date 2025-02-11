import React, {useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import axios from '../../../api/axios';

const RoomNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accommodationId = searchParams.get('accommodationId') || '';

  const [formData, setFormData] = useState({
    accommodation: accommodationId,
    name: '',
    description: '',
    pricePerNight: '',
    maxGuests: '',
    amenities: [''], // 🔹 초기값 빈 배열로 설정
    available: true,
    availableCount: '',
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // 🔹 입력값 변경 핸들러
  const handleChange = e => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  // ✅ 편의시설 추가 핸들러 (삭제하지 않고 폼에서 사용)
  const handleAddAmenity = () => {
    setFormData({...formData, amenities: [...formData.amenities, '']});
  };

  const handleRemoveAmenity = index => {
    const newAmenities = formData.amenities.filter((_, i) => i !== index);
    setFormData({...formData, amenities: newAmenities});
  };

  const handleAmenityChange = (index, value) => {
    const newAmenities = [...formData.amenities];
    newAmenities[index] = value;
    setFormData({...formData, amenities: newAmenities});
  };

  // 🔹 파일 업로드 핸들러 (미리보기 포함)
  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file) // ✅ preview 속성 추가
    }));

    setPreviewImages(prev => [...prev, ...newFiles.map(f => f.preview)]);
    setNewImages(prev => [...prev, ...newFiles]); // ✅ 새 이미지 저장
  };

  // ✅ 이미지 삭제 핸들러
  const handleDeleteImage = imageUrl => {
    console.log('🛑 삭제할 이미지:', imageUrl);

    if (imageUrl.startsWith('blob:')) {
      setNewImages(prev => prev.filter(img => img.preview !== imageUrl)); // ✅ 정확하게 제거
    } else {
      setImagesToDelete(prev => [...prev, imageUrl]);
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageUrl)
      }));
    }

    setPreviewImages(prev => prev.filter(img => img !== imageUrl));
  };

  // ✅ 생성 요청 핸들러 (FormData로 업로드)
  const handleSubmit = async e => {
    e.preventDefault();

    const newRoomData = new FormData();
    newRoomData.append('accommodation', formData.accommodation);
    newRoomData.append('name', formData.name);
    newRoomData.append('description', formData.description);
    newRoomData.append('pricePerNight', formData.pricePerNight);
    newRoomData.append('maxGuests', formData.maxGuests);
    newRoomData.append('available', formData.available);
    newRoomData.append('availableCount', formData.availableCount);
    newRoomData.append('amenities', JSON.stringify(formData.amenities));

    // ✅ 기존 이미지 중 삭제되지 않은 이미지만 유지
    const remainingImages = formData.images.filter(img => !imagesToDelete.includes(img));
    newRoomData.append('existingImages', JSON.stringify(remainingImages));

    // ✅ `newImages`에서 삭제된 이미지를 제외하고 남은 이미지만 추가
    const finalNewImages = newImages
      .filter(img => !imagesToDelete.includes(img.preview)) // `preview` 값 기준으로 삭제 여부 확인
      .map(img => img.file); // ✅ `File` 객체만 추출

    console.log('📌 최종 업로드할 새로운 이미지:', finalNewImages);

    if (finalNewImages.length > 0) {
      finalNewImages.forEach(image => {
        newRoomData.append('images', image);
      });
    } else {
      console.log('🚨 업로드할 새 이미지 없음!');
    }

    try {
      console.log('📌 삭제할 이미지 리스트:', imagesToDelete);

      // ✅ 이미지 삭제 요청 (이미 존재하는 이미지 삭제)
      if (imagesToDelete.length > 0) {
        await axios.post(
          `/rooms/${formData.accommodation}/images/delete`,
          {deletedImages: imagesToDelete},
          {headers: {'Content-Type': 'application/json'}}
        );
      }

      // ✅ 새 객실 생성 요청
      await axios.post('/rooms', newRoomData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });

      alert('새 객실이 추가되었습니다.');
      navigate(`/product/accommodations/modify/${accommodationId}`);
    } catch (err) {
      console.error('❌ 객실 생성 오류:', err);
      alert('객실 생성에 실패했습니다.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>새 객실 추가</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">숙소 ID</label>
          <input
            type="text"
            className="form-control"
            name="accommodation"
            value={formData.accommodation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">객실명</label>
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
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">가격</label>
          <input
            type="number"
            className="form-control"
            name="pricePerNight"
            value={formData.pricePerNight}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">최대 인원</label>
          <input
            type="number"
            className="form-control"
            name="maxGuests"
            value={formData.maxGuests}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">방 개수</label>
          <input
            type="number"
            className="form-control"
            name="availableCount"
            value={formData.availableCount}
            onChange={handleChange}
            required
          />
        </div>

        {/* ✅ 편의시설 입력 UI 추가 */}
        <div className="mb-3">
          <label className="form-label">편의시설</label>
          {formData.amenities.map((amenity, index) => (
            <div key={index} className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                value={amenity}
                onChange={e => handleAmenityChange(index, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemoveAmenity(index)}
              >
                삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary mt-2"
            onClick={handleAddAmenity}
          >
            + 추가
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">객실 이미지</label>
          <input
            type="file"
            className="form-control"
            multiple
            onChange={handleFileChange}
          />
        </div>

        {/* 🔹 업로드한 이미지 미리보기 및 삭제 */}
        {previewImages.length > 0 && (
          <div className="image-preview">
            {previewImages.map((image, index) => (
              <div key={index} className="preview-container">
                <img src={image} alt={`preview-${index}`} className="preview-image" />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteImage(image)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          객실 추가
        </button>
      </form>
    </div>
  );
};

export default RoomNew;
