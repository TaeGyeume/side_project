import React, {useEffect, useState} from 'react';
import {fetchCoupons, deleteCoupon} from '../../../api/coupon/couponService';
import {Card, Container, Row, Col, Badge, Button, Spinner} from 'react-bootstrap';
import './styles/CouponList.css';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getCoupons = async () => {
      try {
        const data = await fetchCoupons();
        setCoupons(data);
      } catch (err) {
        setError(err.message || '쿠폰을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    getCoupons();
  }, []);

  // ✅ 쿠폰 삭제 함수
  const handleDelete = async couponId => {
    const confirmDelete = window.confirm('정말로 이 쿠폰을 삭제하시겠습니까?');

    if (confirmDelete) {
      try {
        await deleteCoupon(couponId);
        setCoupons(prev => prev.filter(coupon => coupon._id !== couponId)); // ✅ UI에서 삭제
        alert('쿠폰이 삭제되었습니다.');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">쿠폰을 불러오는 중...</span>
        </Spinner>
      </div>
    );
  if (error) return <p className="error">{error}</p>;

  return (
    <Container>
      <h2 className="coupon-title">🎫 쿠폰 목록</h2>
      <Row>
        {coupons.length > 0 ? (
          coupons.map(coupon => (
            <Col key={coupon._id} md={4} sm={6} xs={12} className="mb-4">
              <Card className="coupon-card">
                <Card.Body>
                  <Card.Title className="coupon-name">{coupon.name}</Card.Title>
                  <Badge
                    bg={coupon.discountType === 'percentage' ? 'primary' : 'success'}>
                    {coupon.discountType === 'percentage' ? '퍼센트 할인' : '정액 할인'}
                  </Badge>
                  <Card.Text className="coupon-description">
                    {coupon.description}
                  </Card.Text>
                  <hr />
                  <div className="coupon-details">
                    <p>
                      할인 금액: <strong>{coupon.discountValue}</strong>
                      {coupon.discountType === 'percentage' ? '%' : '원'}
                    </p>
                    <p>
                      최대 할인:{' '}
                      {coupon.maxDiscountAmount > 0
                        ? `${coupon.maxDiscountAmount}원`
                        : '없음'}
                    </p>
                    <p>최소 구매 금액: {coupon.minPurchaseAmount}원</p>
                    <p>적용 대상: {coupon.applicableMemberships.join(', ')}</p>
                    <p>만료일: {new Date(coupon.expiresAt).toLocaleString()}</p>
                  </div>
                  <Button variant="danger" onClick={() => handleDelete(coupon._id)}>
                    ❌ 삭제
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="no-coupons">등록된 쿠폰이 없습니다.</p>
        )}
      </Row>
    </Container>
  );
};

export default CouponList;
