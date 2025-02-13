import React, {useEffect, useState} from 'react';
import {fetchCouponsByMembership, claimCoupon} from '../api/coupon/couponService';
import {authAPI} from '../api/auth'; // ✅ 유저 정보 불러오기
import {Card, Button, Spinner} from 'react-bootstrap';

const CouponSidebar = () => {
  const [user, setUser] = useState(null); // ✅ 유저 정보 저장
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimedCoupons, setClaimedCoupons] = useState(new Set()); // 받은 쿠폰 저장

  // ✅ 유저 정보 불러오기
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await authAPI.getUserProfile(); // ✅ 수정된 부분
        setUser(response); // ✅ 유저 정보 저장
      } catch (error) {
        console.error('유저 정보 로드 오류:', error.message);
      }
    };

    getUserInfo();
  }, []);

  // ✅ 쿠폰 불러오기 (유저 정보가 있을 때만 실행)
  useEffect(() => {
    if (user && user.membershipLevel) {
      const getCoupons = async () => {
        try {
          const data = await fetchCouponsByMembership(user.membershipLevel);
          setCoupons(data);
        } catch (error) {
          console.error('쿠폰 로드 오류:', error.message);
        } finally {
          setLoading(false);
        }
      };

      getCoupons();
    }
  }, [user]);

  // ✅ 쿠폰 받기 (다운로드)
  const handleClaimCoupon = async couponId => {
    try {
      const response = await claimCoupon(user._id, couponId);
      alert(response.message); // ✅ 성공 메시지 출력
      setClaimedCoupons(prev => new Set(prev).add(couponId)); // ✅ 받은 쿠폰 상태 업데이트
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="coupon-sidebar">
      <h4>🎟 사용 가능한 쿠폰</h4>

      {/* ✅ 유저 정보가 없을 때 */}
      {!user ? (
        <p>🔒 로그인 후 쿠폰을 확인할 수 있습니다.</p>
      ) : loading ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">쿠폰 로딩 중...</span>
        </Spinner>
      ) : coupons.length > 0 ? (
        coupons.map(coupon => (
          <Card key={coupon._id} className="coupon-card">
            <Card.Body>
              <Card.Title>{coupon.name}</Card.Title>
              <Card.Text>{coupon.description}</Card.Text>
              <Button
                variant="success"
                onClick={() => handleClaimCoupon(coupon._id)}
                disabled={claimedCoupons.has(coupon._id)}>
                {claimedCoupons.has(coupon._id) ? '✅ 받은 쿠폰' : '📥 쿠폰 받기'}
              </Button>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>사용 가능한 쿠폰이 없습니다.</p>
      )}
    </div>
  );
};

export default CouponSidebar;
