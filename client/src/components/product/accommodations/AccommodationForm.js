import React, {useState, useEffect} from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Chip,
  Box,
  IconButton,
  ImageList,
  ImageListItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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

  // 🔹 편의시설 삭제 핸들러
  const handleRemoveAmenity = index => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index) // ✅ 정확한 인덱스의 값만 삭제
    }));
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
    <Paper sx={{p: 4, maxWidth: 650, mx: 'auto', mt: 4, boxShadow: 4}}>
      <Typography variant="h5" sx={{mb: 3, fontWeight: 'bold'}}>
        숙소 등록
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="숙소명"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          sx={{mb: 2}}
        />
        <TextField
          fullWidth
          label="설명"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
          sx={{mb: 2}}
        />

        <FormControl fullWidth sx={{mb: 2}} variant="outlined">
          <InputLabel id="country-label">국가 선택</InputLabel>
          <Select
            labelId="country-label"
            value={selectedCountry}
            onChange={handleCountryChange}
            label="국가 선택" // ✅ label을 Select에 추가해야 InputLabel과 연동됨
          >
            {countries.map((country, index) => (
              <MenuItem key={index} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{mb: 2}} variant="outlined">
          <InputLabel id="city-label">도시 선택</InputLabel>
          <Select
            labelId="city-label"
            name="location"
            value={formData.location}
            onChange={handleChange}
            label="도시 선택">
            {cities.map(city => (
              <MenuItem key={city._id} value={city._id}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="주소"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          sx={{mb: 2}}
        />

        <Box sx={{display: 'flex', gap: 2, mb: 2}}>
          <TextField
            fullWidth
            label="경도"
            name="lng"
            type="number"
            value={formData.coordinates.lng}
            onChange={handleCoordinateChange}
            required
          />
          <TextField
            fullWidth
            label="위도"
            name="lat"
            type="number"
            value={formData.coordinates.lat}
            onChange={handleCoordinateChange}
            required
          />
        </Box>

        {/* 🔹 카테고리 선택 */}
        <FormControl fullWidth sx={{mb: 3}} variant="outlined">
          <InputLabel id="category-label">카테고리</InputLabel>
          <Select
            labelId="category-label"
            name="category"
            value={formData.category}
            onChange={handleChange}
            label="카테고리">
            <MenuItem value="Hotel">호텔</MenuItem>
            <MenuItem value="Pension">펜션</MenuItem>
            <MenuItem value="Resort">리조트</MenuItem>
            <MenuItem value="Motel">모텔</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="편의시설 추가 (Enter 입력)"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault(); // ✅ 엔터 입력 시 폼 제출 방지
              if (e.target.value.trim()) {
                setFormData(prev => ({
                  ...prev,
                  amenities: [...prev.amenities, e.target.value.trim()]
                }));
                e.target.value = ''; // 입력창 초기화
              }
            }
          }}
        />
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2}}>
          {formData.amenities.map((amenity, index) => (
            <Chip
              key={index}
              label={amenity}
              onDelete={() => handleRemoveAmenity(index)} // ✅ 인덱스를 전달하여 삭제
              sx={{bgcolor: 'lightgray', color: 'black'}}
            />
          ))}
        </Box>

        {/* 🔹 숙소 이미지 업로드 */}
        <Box sx={{mb: 3}}>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{mb: 2}}>
            이미지 업로드
            <input
              type="file"
              name="images"
              multiple
              onChange={handleFileChange}
              hidden
            />
          </Button>

          {/* 🔹 업로드한 이미지 미리보기 */}
          {previewImages.length > 0 && (
            <ImageList cols={3} rowHeight={100}>
              {previewImages.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image}
                    alt={`preview-${index}`}
                    style={{borderRadius: '8px'}}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white'
                    }}
                    size="small"
                    onClick={() => handleRemoveImage(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Box>

        <Button type="submit" variant="contained" fullWidth sx={{mt: 3}}>
          숙소 등록
        </Button>
      </form>
    </Paper>
  );
};

export default AccommodationForm;
