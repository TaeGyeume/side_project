// src/components/accommodations/AccommodationImageGallery.js
import React, {useState} from 'react';
import Slider from 'react-slick';
import Modal from 'react-modal';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {IconButton} from '@mui/material';
import {ArrowBackIos, ArrowForwardIos} from '@mui/icons-material';

const AccommodationImageGallery = ({images, accommodationName, serverUrl}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  // React Slick 설정
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
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

  // 이미지 클릭 시 모달 열기
  const openModal = index => {
    setSelectedImageIndex(index);
    setModalIsOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalIsOpen(false);
  };

  // 다음 이미지 보기
  const nextImage = () => {
    setSelectedImageIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  // 이전 이미지 보기
  const prevImage = () => {
    setSelectedImageIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div>
      {/* 이미지 슬라이더 */}
      <Slider {...settings} className="mb-3">
        {images.map((img, index) => {
          let imageUrl = img.startsWith('/uploads/') ? `${serverUrl}${img}` : img;

          return (
            <div key={index} className="carousel-slide" style={{cursor: 'pointer'}}>
              <img
                src={imageUrl}
                alt={`${accommodationName} 이미지 ${index + 1}`}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                onClick={() => openModal(index)}
              />
            </div>
          );
        })}
      </Slider>

      {/* 이미지 확대 모달 */}
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
            zIndex: 1300
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
            zIndex: 1300
          }
        }}>
        {/* 이전 버튼 */}
        <IconButton
          onClick={prevImage}
          sx={{
            position: 'absolute',
            left: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            '&:hover': {backgroundColor: 'rgba(0, 0, 0, 0.8)'},
            padding: '12px',
            borderRadius: '50%'
          }}>
          <ArrowBackIos />
        </IconButton>

        {/* 확대 이미지 */}
        <img
          src={`${serverUrl}${images[selectedImageIndex]}`}
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
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            '&:hover': {backgroundColor: 'rgba(0, 0, 0, 0.8)'},
            padding: '12px',
            borderRadius: '50%'
          }}>
          <ArrowForwardIos />
        </IconButton>
      </Modal>
    </div>
  );
};

export default AccommodationImageGallery;
