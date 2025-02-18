import React, {useEffect, useState} from 'react';
import {fetchPopularProducts} from '../../api/views/viewsService';
import Slider from 'react-slick';
import {Link} from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './styles/PopularProductsSlider.css';

const SERVER_URL = 'http://localhost:5000';

const PopularProductsSlider = () => {
  const [products, setProducts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0); // ✅ 현재 슬라이드 인덱스 저장

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await fetchPopularProducts(8);
        if (isMounted) setProducts(data);
      } catch (error) {
        console.error('❌ 인기 상품 불러오기 실패:', error);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = Math.ceil(products.length / 4); // ✅ 총 슬라이드 수

  // ✅ 이전 버튼 커스텀 (첫 번째 슬라이드일 때 숨김)
  const PrevArrow = ({onClick}) =>
    currentSlide > 0 && (
      <button className="custom-arrow custom-prev" onClick={onClick}>
        ⬅
      </button>
    );

  // ✅ 다음 버튼 커스텀 (마지막 슬라이드일 때 숨김)
  const NextArrow = ({onClick}) =>
    currentSlide < totalSlides - 1 && (
      <button className="custom-arrow custom-next" onClick={onClick}>
        ➡
      </button>
    );

  // ✅ React Slick 설정 (현재 슬라이드 상태 업데이트 추가)
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: false,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex), // ✅ 슬라이드 변경 감지
    responsive: [
      {breakpoint: 1024, settings: {slidesToShow: 3, slidesToScroll: 3}},
      {breakpoint: 768, settings: {slidesToShow: 2, slidesToScroll: 2}},
      {breakpoint: 480, settings: {slidesToShow: 1, slidesToScroll: 1}}
    ]
  };

  return (
    <div className="popular-products-container">
      <h2 className="section-title">🔥 인기 상품</h2>
      <Slider {...settings} className="popular-products-slider">
        {products.map(product => {
          const productId = product._id;
          let imageUrl = '/default-image.jpg';

          if (product.images?.length > 0 && !imageErrors[productId]) {
            imageUrl =
              product.type === 'tourTicket'
                ? `${SERVER_URL}${product.images[0]}`
                : product.images[0];
          }

          return (
            <div key={productId} className="product-card">
              <Link
                to={
                  product.type === 'tourTicket'
                    ? `/tourTicket/list/${productId}`
                    : `/travelItems/${productId}`
                }>
                <div className="product-image">
                  <img
                    src={imageUrl}
                    alt={product.title || product.name}
                    onError={e => {
                      if (!imageErrors[productId]) {
                        setImageErrors(prev => ({...prev, [productId]: true}));
                      }
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3>{product.title || product.name}</h3>
                  <p>{product.price.toLocaleString()} 원</p>
                  <p>조회수: {product.views}</p>
                </div>
              </Link>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default PopularProductsSlider;
