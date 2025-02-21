import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {createLocation, updateLocation} from '../../../api/location/locationService';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Stack,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const LocationForm = ({locationData = null, isEdit = false}) => {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    latitude: '',
    longitude: '',
    popularPlaces: ['']
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit && locationData) {
      setFormData({
        name: locationData.name,
        country: locationData.country,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        popularPlaces: locationData.popularPlaces || ['']
      });
    }
  }, [locationData, isEdit]);

  const handleChange = e => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  const handlePopularPlaceChange = (index, value) => {
    const updatedPlaces = [...formData.popularPlaces];
    updatedPlaces[index] = value;
    setFormData({...formData, popularPlaces: updatedPlaces});
  };

  const handleAddPopularPlace = () => {
    setFormData(prev => ({
      ...prev,
      popularPlaces: [...prev.popularPlaces, '']
    }));
  };

  const handleRemovePopularPlace = index => {
    setFormData(prev => ({
      ...prev,
      popularPlaces: prev.popularPlaces.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const formattedData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        popularPlaces: formData.popularPlaces.filter(place => place.trim() !== '')
      };

      if (isEdit) {
        await updateLocation(locationData._id, formattedData);
        alert('위치가 수정되었습니다.');
      } else {
        await createLocation(formattedData);
        alert('위치가 추가되었습니다.');
      }

      navigate('/product/locations/list');
    } catch (err) {
      setError('위치 처리 중 오류 발생');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 500,
        mx: 'auto',
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: 'white'
      }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {isEdit ? '📍 위치 수정' : '📍 위치 추가'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{mb: 2}}>
          {error}
        </Alert>
      )}

      {/* 도시명 입력 */}
      <TextField
        label="도시명"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      {/* 국가 입력 */}
      <TextField
        label="국가"
        name="country"
        value={formData.country}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      {/* 위도 입력 */}
      <TextField
        label="위도"
        name="latitude"
        type="number"
        value={formData.latitude}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      {/* 경도 입력 */}
      <TextField
        label="경도"
        name="longitude"
        type="number"
        value={formData.longitude}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      {/* 인기 여행지 입력 필드 */}
      <Typography variant="subtitle1" fontWeight="bold" mt={2}>
        인기 여행지
      </Typography>
      {formData.popularPlaces.map((place, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{mt: 1}}>
          <TextField
            fullWidth
            value={place}
            onChange={e => handlePopularPlaceChange(index, e.target.value)}
            placeholder="여행지 이름 입력"
          />
          <IconButton color="error" onClick={() => handleRemovePopularPlace(index)}>
            <RemoveCircleOutlineIcon />
          </IconButton>
        </Stack>
      ))}

      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        onClick={handleAddPopularPlace}
        sx={{mt: 2}}>
        인기 여행지 추가
      </Button>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{mt: 3, p: 1.5, fontSize: '16px'}}>
        {isEdit ? '📍 위치 수정' : '📍 위치 추가'}
      </Button>
    </Box>
  );
};

export default LocationForm;
