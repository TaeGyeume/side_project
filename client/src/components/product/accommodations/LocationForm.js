import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {createLocation, updateLocation} from '../../../api/location/locationService';

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
    <form onSubmit={handleSubmit}>
      {error && <p className="text-danger">{error}</p>}

      <div className="mb-3">
        <label className="form-label">도시명</label>
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
        <label className="form-label">국가</label>
        <input
          type="text"
          className="form-control"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">위도</label>
        <input
          type="number"
          step="any"
          className="form-control"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">경도</label>
        <input
          type="number"
          step="any"
          className="form-control"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">인기 여행지</label>
        {formData.popularPlaces.map((place, index) => (
          <div key={index} className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              value={place}
              onChange={e => handlePopularPlaceChange(index, e.target.value)}
            />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleRemovePopularPlace(index)}>
              삭제
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary mt-2"
          onClick={handleAddPopularPlace}>
          + 추가
        </button>
      </div>

      <button type="submit" className="btn btn-primary">
        {isEdit ? '📍 위치 수정' : '📍 위치 추가'}
      </button>
    </form>
  );
};

export default LocationForm;
