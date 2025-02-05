import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from '../../../api/axios';
import RoomCard from '../../../components/accommodations/RoomCard';

const AccommodationModify = () => {
  const {accommodationId} = useParams();
  const navigate = useNavigate();
  const SERVER_URL = 'http://localhost:5000';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    location: '',
    coordinates: {lat: '', lng: ''},
    category: '',
    amenities: [],
    images: [],
    rooms: []
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ 기존 숙소 데이터 가져오기
  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const response = await axios.get(`/accommodations/${accommodationId}`);
        console.log('📌 받은 데이터:', response.data); // ✅ 디버깅 추가

        const data = response.data;

        // ✅ `coordinates.coordinates` 배열이 없을 경우 예외처리
        const coordinatesData = Array.isArray(data.coordinates?.coordinates)
          ? data.coordinates.coordinates
          : [126.978, 37.5665]; // 기본값 설정

        setFormData({
          ...data,
          coordinates: {
            lat: coordinatesData[1] || '', // 위도
            lng: coordinatesData[0] || '' // 경도
          },
          images: data.images || []
        });

        setPreviewImages(
          data.images.map(img =>
            img.startsWith('/uploads/') ? `${SERVER_URL}${img}` : img
          )
        );

        setLoading(false);
      } catch (err) {
        console.error('❌ 숙소 정보 불러오기 오류:', err);
        setError('숙소 정보를 불러오는 중 오류 발생');
        setLoading(false);
      }
    };

    fetchAccommodation();
  }, [accommodationId]);

  // ✅ 객실 데이터 가져오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (formData.rooms.length > 0) {
          const roomsResponse = await axios.get(
            `/accommodations/${accommodationId}/rooms`
          );
          console.log('📌 객실 데이터:', roomsResponse.data);
          setAvailableRooms(roomsResponse.data.availableRooms || []);
        }
      } catch (err) {
        console.error('❌ 객실 정보 불러오기 오류:', err);
        setError('객실 정보를 불러오는 중 오류 발생');
      }
    };

    if (formData.rooms.length > 0) {
      fetchRooms();
    }
  }, [accommodationId, formData.rooms]);

  // 🔹 입력값 변경 핸들러
  const handleChange = e => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  // 🔹 좌표 입력 핸들러
  const handleCoordinateChange = e => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      coordinates: {
        ...formData.coordinates,
        [name]: parseFloat(value) || ''
      }
    });
  };

  // 🔹 파일 업로드 핸들러 (미리보기 포함)
  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));

    setPreviewImages([...previewImages, ...newPreviews]);
    setNewImages([...newImages, ...files]); // 🆕 새 이미지 저장
  };

  // 🔹 이미지 삭제 핸들러 (백엔드 요청 X, UI에서만 숨김)
  const handleDeleteImage = imageUrl => {
    setImagesToDelete([...imagesToDelete, imageUrl]); // 🛑 삭제할 이미지 목록에 추가
    setPreviewImages(previewImages.filter(img => img !== imageUrl));
    setFormData({
      ...formData,
      images: formData.images.filter(img => img !== imageUrl.replace(SERVER_URL, ''))
    });
  };

  // 🔹 편의시설 추가 핸들러
  const handleAddAmenity = () => {
    setFormData({...formData, amenities: [...formData.amenities, '']});
  };

  // 🔹 편의시설 삭제 핸들러
  const handleRemoveAmenity = index => {
    const newAmenities = formData.amenities.filter((_, i) => i !== index);
    setFormData({...formData, amenities: newAmenities});
  };

  // 🔹 편의시설 입력 변경 핸들러
  const handleAmenityChange = (index, value) => {
    const newAmenities = [...formData.amenities];
    newAmenities[index] = value;
    setFormData({...formData, amenities: newAmenities});
  };

  // ✅ 수정 요청 핸들러 (FormData로 업로드)
  const handleSubmit = async e => {
    e.preventDefault();

    console.log('📌 제출 직전 좌표 값:', formData.coordinates);

    // ✅ 최신 좌표 값을 가져와서 저장
    const coordinates = {
      type: 'Point',
      coordinates: [
        parseFloat(formData.coordinates.lng) || 126.978, // 경도
        parseFloat(formData.coordinates.lat) || 37.5665 // 위도
      ]
    };

    console.log('📌 변환된 좌표 데이터:', JSON.stringify(coordinates));

    const updatedFormData = new FormData();
    updatedFormData.append('name', formData.name);
    updatedFormData.append('description', formData.description);
    updatedFormData.append('location', formData.location);
    updatedFormData.append('address', formData.address);
    updatedFormData.append('category', formData.category);
    updatedFormData.append('coordinates', JSON.stringify(coordinates));
    updatedFormData.append('amenities', JSON.stringify(formData.amenities));

    // ✅ 기존 이미지 유지 (삭제되지 않은 이미지만 추가)
    const remainingImages = formData.images.filter(img => !imagesToDelete.includes(img));
    updatedFormData.append('existingImages', JSON.stringify(remainingImages));

    // ✅ 새로 업로드한 이미지 추가
    newImages.forEach(image => updatedFormData.append('images', image));

    try {
      console.log('📌 전송할 FormData 확인:');
      for (let pair of updatedFormData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // 숙소 정보 수정 요청
      await axios.patch(`/accommodations/${accommodationId}`, updatedFormData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });

      alert('숙소 정보가 수정되었습니다.');
      navigate(`/product/accommodations/list`);
    } catch (err) {
      console.error('❌ 숙소 수정 오류:', err);
      alert('숙소 수정에 실패했습니다.');
    }
  };

  // 🔄 취소 버튼 클릭 시 원래 데이터로 복원
  const handleCancel = () => {
    setImagesToDelete([]); // 🛑 삭제 요청 목록 초기화
    setPreviewImages(
      formData.images.map(img =>
        img.startsWith('/uploads/') ? `${SERVER_URL}${img}` : img
      )
    );
    navigate(-1);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-4">
      <h2>숙소 수정</h2>
      <form onSubmit={handleSubmit}>
        {/* 🔹 숙소명 */}
        <div className="mb-3">
          <label className="form-label">숙소명</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* 🔹 설명 */}
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

        {/* 🔹 주소 */}
        <div className="mb-3">
          <label className="form-label">주소</label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* 🔹 좌표 입력 */}
        <div className="mb-3">
          <label className="form-label">위도 (Latitude)</label>
          <input
            type="number"
            className="form-control"
            name="lat"
            value={formData.coordinates.lat}
            onChange={handleCoordinateChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">경도 (Longitude)</label>
          <input
            type="number"
            className="form-control"
            name="lng"
            value={formData.coordinates.lng}
            onChange={handleCoordinateChange}
            required
          />
        </div>

        {/* 🔹 카테고리 선택 */}
        <div className="mb-3">
          <label className="form-label">카테고리</label>
          <select
            className="form-control"
            name="category"
            value={formData.category}
            onChange={handleChange}>
            <option value="Hotel">호텔</option>
            <option value="Pension">펜션</option>
            <option value="Resort">리조트</option>
            <option value="Motel">모텔</option>
          </select>
        </div>

        {/* 🔹 편의시설 */}
        <div className="mb-3">
          <label className="form-label">편의시설</label>
          {formData.amenities.map((amenity, index) => (
            <div key={index}>
              <input
                type="text"
                value={amenity}
                onChange={e => handleAmenityChange(index, e.target.value)}
                className="form-control"
              />
              <button type="button" onClick={() => handleRemoveAmenity(index)}>
                삭제
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddAmenity}>
            + 추가
          </button>
        </div>

        {/* 🔹 숙소 이미지 업로드 */}
        <div className="mb-3">
          <label className="form-label">숙소 이미지</label>
          <input
            type="file"
            className="form-control"
            name="images"
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
                  onClick={() => handleDeleteImage(image)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
        {/* ✅ 객실 추가 버튼 */}
        <button
          type="button"
          className="btn btn-primary mt-2"
          onClick={() =>
            navigate(`/product/room/new?accommodationId=${accommodationId}`)
          }>
          + 객실 추가
        </button>

        {/* ✅ 방 정보 표시 */}
        <h3>객실 목록</h3>
        {availableRooms.length > 0 ? (
          availableRooms.map(room => <RoomCard key={room._id} room={room} />)
        ) : (
          <p>예약 가능한 객실이 없습니다.</p>
        )}

        <button type="submit" className="btn btn-primary">
          수정 완료
        </button>
        <button type="button" className="btn btn-secondary ms-2" onClick={handleCancel}>
          취소
        </button>
      </form>
    </div>
  );
};

export default AccommodationModify;
