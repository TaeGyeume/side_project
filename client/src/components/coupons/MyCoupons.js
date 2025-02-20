import React, {useEffect, useState} from 'react';
import {fetchUserCoupons} from '../../api/coupon/couponService';
import {Card, Container, Row, Col, Badge, Spinner} from 'react-bootstrap';
import './styles/MyCoupons.css';

const MyCoupons = ({userId}) => {
  const [unusedCoupons, setUnusedCoupons] = useState([]);
  const [usedCoupons, setUsedCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getUserCoupons = async () => {
      try {
        const data = await fetchUserCoupons(userId);

        // 사용된 쿠폰과 사용되지 않은 쿠폰 분리
        setUnusedCoupons(data.filter(coupon => !coupon.isUsed));
        setUsedCoupons(data.filter(coupon => coupon.isUsed));
      } catch (err) {
        setError(err.message || '쿠폰을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) getUserCoupons();
  }, [userId]);

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
      <h2 className="coupon-title">🎫 내 쿠폰함</h2>

      {/* 사용 가능한 쿠폰 섹션 */}
      <section>
        <h4 className="coupon-section-title">✅ 사용 가능한 쿠폰</h4>
        <Row>
          {unusedCoupons.length > 0 ? (
            unusedCoupons.map(({_id, coupon, issuedAt, expiresAt}) => (
              <Col key={_id} md={4} sm={6} xs={12} className="mb-4">
                <Card className="coupon-card">
                  <Card.Body>
                    <Card.Title className="coupon-name">{coupon.name}</Card.Title>
                    <Card.Text className="coupon-description">
                      {coupon.description}
                    </Card.Text>
                    <hr />
                    <div className="coupon-details">
                      <p>
                        할인 금액: <strong>{coupon.discountValue}</strong>
                        {coupon.discountType === 'percentage' ? '%' : '원'}
                      </p>
                      <p>최소 구매 금액: {coupon.minPurchaseAmount}원</p>
                      <p>발급일: {new Date(issuedAt).toLocaleString()}</p>
                      <p>만료일: {new Date(expiresAt).toLocaleString()}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="no-coupons">사용 가능한 쿠폰이 없습니다.</p>
          )}
        </Row>
      </section>

      {/* 사용된 쿠폰 섹션 */}
      <section>
        <h4 className="coupon-section-title">⚠ 사용된 쿠폰</h4>
        <Row>
          {usedCoupons.length > 0 ? (
            usedCoupons.map(({_id, coupon, issuedAt, expiresAt}) => (
              <Col key={_id} md={4} sm={6} xs={12} className="mb-4">
                <Card className="coupon-card used-coupon">
                  <Card.Body>
                    <Card.Title className="coupon-name">
                      {coupon.name}
                      <Badge bg="secondary" className="ms-2">
                        ⚠ 사용됨
                      </Badge>
                    </Card.Title>
                    <Card.Text className="coupon-description">
                      {coupon.description}
                    </Card.Text>
                    <hr />
                    <div className="coupon-details">
                      <p>
                        할인 금액: <strong>{coupon.discountValue}</strong>
                        {coupon.discountType === 'percentage' ? '%' : '원'}
                      </p>
                      <p>최소 구매 금액: {coupon.minPurchaseAmount}원</p>
                      <p>발급일: {new Date(issuedAt).toLocaleString()}</p>
                      <p>만료일: {new Date(expiresAt).toLocaleString()}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="no-coupons">사용한 쿠폰이 없습니다.</p>
          )}
        </Row>
      </section>
    </Container>
  );
};

export default MyCoupons;
