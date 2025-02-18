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
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const totalSlides = Math.ceil(products.length / 4);

  const PrevArrow = ({onClick}) =>
    currentSlide > 0 && (
      <button className="custom-arrow custom-prev" onClick={onClick}>
        ⬅
      </button>
    );

  const NextArrow = ({onClick}) =>
    currentSlide < totalSlides - 1 && (
      <button className="custom-arrow custom-next" onClick={onClick}>
        ➡
      </button>
    );

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
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
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
            imageUrl = product.images[0];

            // ✅ `/uploads/` 경로라면 서버 URL을 붙이기 (투어티켓 + 여행용품 모두 적용)
            if (imageUrl.startsWith('/uploads/')) {
              imageUrl = `${SERVER_URL}${imageUrl}`;
            }
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
                  <p>조회수: {product.views || 0}</p> {/* ✅ 조회수 없을 때 기본값 0 */}
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
