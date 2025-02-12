import React, {useState, useEffect} from 'react';
import {createAccommodation} from '../../../api/accommodation/accommodationService';
import {fetchCountries, fetchCities} from '../../../api/location/locationService';
import {authAPI} from '../../../api/auth';
import './styles/AccommodationForm.css';
import {useNavigate} from 'react-router-dom';

const AccommodationForm = ({onSubmit, initialData = {}, userId}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    location: initialData.location || '',
    address: initialData.address || '',
    coordinates: {lng: '', lat: ''},
    category: initialData.category || 'Hotel',
    amenities: initialData.amenities || [],
    images: null,
    host: ''
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [countries, setCountries] = useState([]); // 국가 목록
  const [cities, setCities] = useState([]); // 선택한 국가의 도시 목록
  const [selectedCountry, setSelectedCountry] = useState(''); // 현재 선택된 국가
  const navigate = useNavigate();

  // 국가 선택 핸들러
  const handleCountryChange = async e => {
    const country = e.target.value;
    setSelectedCountry(country);
    setCities([]); // 기존 도시 목록 초기화
    setFormData({...formData, location: ''});

    if (country) {
      try {
        const response = await fetchCities(country);
        setCities(response.data);
      } catch (error) {
        console.error('도시 목록 불러오기 오류:', error);
      }
    }
  };

  // 도시 선택 핸들러
  const handleCityChange = e => {
    setFormData({...formData, location: e.target.value});
  };

  // 🔹 입력값 변경 핸들러
  const handleChange = e => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  // 🔹 좌표 입력 핸들러
  const handleCoordinateChange = e => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates, // ✅ 기존 값 유지
        [name]: parseFloat(value) || '' // ✅ 숫자로 변환
      }
    }));
  };

  // 🔹 파일 업로드 핸들러 (미리보기 포함)
  const handleFileChange = e => {
    const files = Array.from(e.target.files);

    // 📌 미리보기 URL 생성
    const newPreviews = files.map(file => URL.createObjectURL(file));

    setPreviewImages([...previewImages, ...newPreviews]); // 기존 이미지 + 새로운 이미지
    setFormData({...formData, images: files});
  };

  // 🔹 업로드한 이미지 삭제 핸들러
  const handleRemoveImage = index => {
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    const updatedImages = Array.from(formData.images).filter((_, i) => i !== index);

    setPreviewImages(updatedPreviews);
    setFormData({...formData, images: updatedImages});
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

  // 🔹 폼 제출 핸들러
  const handleSubmit = async e => {
    e.preventDefault();

    // 좌표가 undefined일 가능성을 방지
    const coordinates = formData.coordinates || {lng: 0, lat: 0};
    const lng = coordinates.lng || 126.978;
    const lat = coordinates.lat || 37.5665;

    // FormData 생성
    const requestData = new FormData();
    requestData.append('name', formData.name);
    requestData.append('description', formData.description);
    requestData.append('location', formData.location);
    requestData.append('address', formData.address);
    requestData.append('category', formData.category);
    requestData.append('host', formData.host);

    // ✅ MongoDB GeoJSON 형식으로 좌표 저장
    requestData.append(
      'coordinates',
      JSON.stringify({
        type: 'Point',
        coordinates: [lng, lat]
      })
    );

    requestData.append('amenities', JSON.stringify(formData.amenities));

    // 파일 업로드 검증
    if (formData.images && formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        requestData.append('images', formData.images[i]);
      }
    } else {
      console.log('⚠️ 업로드할 이미지가 없습니다.');
    }

    // 📌 FormData 디버깅
    for (let pair of requestData.entries()) {
      console.log('✅ 전송할 데이터:', pair[0], pair[1]);
    }

    try {
      await createAccommodation(requestData);
      if (window.confirm('✅ 숙소가 성공적으로 등록되었습니다. 목록으로 이동할까요?')) {
        navigate('/product/accommodations/list');
      }
    } catch (error) {
      console.error('❌ 숙소 등록 오류');
    }
  };

  // ✅ 로그인한 사용자 ID 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authAPI.getUserProfile();
        setFormData(prev => ({...prev, host: userData._id})); // host 필드에 사용자 ID 저장
      } catch (error) {
        console.error('❌ 사용자 프로필 불러오기 오류:', error);
      }
    };
    fetchUserProfile();
  }, []);

  // ✅ 국가 목록 가져오기
  useEffect(() => {
    const fetchCountryList = async () => {
      try {
        const response = await fetchCountries();
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCountries(response.data);
        } else {
          console.warn('⚠️ 받아온 국가 리스트가 비어 있음:', response.data);
        }
      } catch (error) {
        console.error('❌ 국가 목록 불러오기 오류:', error);
      }
    };
    fetchCountryList();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="accommodation-form">
      {/* 🔹 숙소명 */}
      <div>
        <label>숙소명</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* 🔹 설명 */}
      <div>
        <label>설명</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* 🔹 위치 선택 (DB에서 불러오기) */}
      <div>
        <label>국가 선택</label>
        <select name="country" value={selectedCountry} onChange={handleCountryChange}>
          <option value="">국가를 선택하세요</option>
          {countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>도시 선택</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleCityChange}
          required>
          <option value="">도시를 선택하세요</option>
          {cities.map(city => (
            <option key={city._id} value={city._id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 좌표 입력 (경도, 위도) */}
      <div>
        <label>경도 (Longitude)</label>
        <input
          type="number"
          name="lng"
          step="any"
          value={formData.coordinates.lng}
          onChange={handleCoordinateChange}
          required
        />
      </div>
      <div>
        <label>위도 (Latitude)</label>
        <input
          type="number"
          name="lat"
          step="any"
          value={formData.coordinates.lat}
          onChange={handleCoordinateChange}
          required
        />
      </div>

      {/* 🔹 주소 입력 */}
      <div>
        <label>주소</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>

      {/* 🔹 카테고리 선택 */}
      <div>
        <label>카테고리</label>
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Hotel">호텔</option>
          <option value="Pension">펜션</option>
          <option value="Resort">리조트</option>
          <option value="Motel">모텔</option>
        </select>
      </div>

      {/* 🔹 편의시설 (배열) */}
      <div>
        <label>편의시설</label>
        {formData.amenities.map((amenity, index) => (
          <div key={index}>
            <input
              type="text"
              value={amenity}
              onChange={e => handleAmenityChange(index, e.target.value)}
              placeholder="편의시설 입력"
            />
            <button type="button" onClick={() => handleRemoveAmenity(index)}>
              X
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddAmenity}>
          + 추가
        </button>
      </div>

      {/* 🔹 숙소 이미지 업로드 */}
      <div>
        <label>숙소 이미지</label>
        <input type="file" name="images" multiple onChange={handleFileChange} />
      </div>

      {/* 🔹 업로드한 이미지 미리보기 및 삭제 */}
      {previewImages.length > 0 && (
        <div className="image-preview">
          {previewImages.map((image, index) => (
            <div key={index} className="preview-container">
              <img src={image} alt={`preview-${index}`} className="preview-image" />
              <button type="button" onClick={() => handleRemoveImage(index)}>
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="submit">숙소 등록</button>
    </form>
  );
};

export default AccommodationForm;
