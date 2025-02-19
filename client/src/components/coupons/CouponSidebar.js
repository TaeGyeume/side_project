import React, {useEffect, useState} from 'react';
import {
  fetchCouponsByMembership,
  claimCoupon,
  fetchUserCoupons
} from '../../api/coupon/couponService';
import {authAPI} from '../../api/auth';
import {Card, Button, Spinner} from 'react-bootstrap';
import {FaChevronDown, FaChevronUp, FaTicketAlt} from 'react-icons/fa';
import './styles/CouponSidebar.css';

const CouponSidebar = () => {
  const [user, setUser] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimedCoupons, setClaimedCoupons] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await authAPI.getUserProfile();
        setUser(response);

        if (response?._id) {
          const userCoupons = await fetchUserCoupons(response._id);
          const claimedSet = new Set(userCoupons.map(coupon => coupon.coupon._id));
          setClaimedCoupons(claimedSet);
        }
      } catch (error) {
        console.error('유저 정보 로드 오류:', error.message);
      }
    };

    getUserInfo();
  }, []);

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

  const handleClaimCoupon = async couponId => {
    try {
      const response = await claimCoupon(user._id, couponId);
      alert(response.message);
      setClaimedCoupons(prev => new Set(prev).add(couponId));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={`coupon-sidebar ${isOpen ? 'open' : ''}`}>
      <button className="coupon-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaChevronDown /> : <FaTicketAlt />}
      </button>

      <div className="coupon-container">
        <h4 className="coupon-header">🎫 쿠폰 목록</h4>

        {!user ? (
          <p className="coupon-text">🔒 로그인 후 쿠폰을 확인할 수 있습니다.</p>
        ) : loading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">쿠폰 로딩 중...</span>
          </Spinner>
        ) : coupons.length > 0 ? (
          <div className="coupon-list">
            {coupons.map(coupon => (
              <Card key={coupon._id} className="coupon-card">
                <Card.Body>
                  <Card.Title className="coupon-title">{coupon.name}</Card.Title>
                  <Card.Text className="coupon-text">{coupon.description}</Card.Text>
                  <Button
                    variant={claimedCoupons.has(coupon._id) ? 'secondary' : 'success'}
                    onClick={() => handleClaimCoupon(coupon._id)}
                    disabled={claimedCoupons.has(coupon._id)}
                    className="coupon-btn">
                    {claimedCoupons.has(coupon._id) ? '✅ 받은 쿠폰' : '📥 쿠폰 받기'}
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p className="coupon-text">사용 가능한 쿠폰이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default CouponSidebar;
