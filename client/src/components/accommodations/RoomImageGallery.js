import React, {useState} from 'react';
import Slider from 'react-slick';
import Modal from 'react-modal';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {IconButton, Box} from '@mui/material';
import {ArrowBackIos, ArrowForwardIos, Close} from '@mui/icons-material';

const RoomImageGallery = ({imageUrls}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openModal = index => {
    setSelectedImageIndex(index);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const prevImage = () => {
    setSelectedImageIndex(
      prevIndex => (prevIndex - 1 + imageUrls.length) % imageUrls.length
    );
  };

  const nextImage = () => {
    setSelectedImageIndex(prevIndex => (prevIndex + 1) % imageUrls.length);
  };

  const sliderSettings = {
    dots: imageUrls.length > 1, // 이미지 1개면 dots 비활성화
    infinite: imageUrls.length > 1, // 이미지 1개면 무한 스크롤 비활성화
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: imageUrls.length > 1, // 1개일 때 자동 재생 X
    autoplaySpeed: 3000,
    arrows: imageUrls.length > 1, // 이미지 1개면 화살표 숨김
    beforeChange: (current, next) => {
      document.querySelectorAll('.slick-slide').forEach(slide => {
        if (slide.getAttribute('aria-hidden') === 'true') {
          slide.setAttribute('tabindex', '-1'); // 포커스 방지
        } else {
          slide.removeAttribute('tabindex'); // 활성화된 슬라이드는 tabindex 제거
        }
      });
    }
  };

  return (
    <Box textAlign="center" sx={{maxWidth: 800, mx: 'auto'}}>
      {/* 이미지 슬라이더 */}
      <Slider {...sliderSettings}>
        {imageUrls.map((img, index) => (
          <Box
            key={index}
            sx={{cursor: 'pointer', borderRadius: '8px'}}
            onClick={() => openModal(index)}>
            <img
              src={img}
              alt={`객실 이미지 ${index + 1}`}
              style={{
                width: '100%',
                height: '450px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
              }}
            />
          </Box>
        ))}
      </Slider>

      {/* 이미지 모달 */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="이미지 확대 보기"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1500
          },
          content: {
            position: 'relative',
            border: 'none',
            background: 'transparent',
            overflow: 'hidden',
            padding: '0',
            width: 'auto',
            height: 'auto',
            inset: 'unset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500
          }
        }}>
        {/* 닫기 버튼 */}
        <IconButton
          onClick={closeModal}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            '&:hover': {backgroundColor: 'rgba(0, 0, 0, 0.8)'},
            padding: '8px',
            borderRadius: '50%'
          }}>
          <Close />
        </IconButton>

        {/* 이전 버튼 */}
        <IconButton
          onClick={prevImage}
          sx={{
            position: 'absolute',
            left: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            '&:hover': {backgroundColor: 'rgba(0, 0, 0, 0.8)'},
            padding: '12px',
            borderRadius: '50%'
          }}>
          <ArrowBackIos />
        </IconButton>

        {/* 확대된 이미지 */}
        <img
          src={imageUrls[selectedImageIndex]}
          alt="확대 이미지"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
          }}
        />

        {/* 다음 버튼 */}
        <IconButton
          onClick={nextImage}
          sx={{
            position: 'absolute',
            right: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            '&:hover': {backgroundColor: 'rgba(0, 0, 0, 0.8)'},
            padding: '12px',
            borderRadius: '50%'
          }}>
          <ArrowForwardIos />
        </IconButton>
      </Modal>
    </Box>
  );
};

export default RoomImageGallery;
