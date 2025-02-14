import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {fetchTravelItemDetail} from '../../api/travelItem/travelItemService';
import {createBooking, verifyPayment} from '../../api/booking/bookingService';
import {fetchUserCoupons} from '../../api/coupon/couponService';
import {authAPI} from '../../api/auth/index';
import CouponSelector from './CouponSelector';

const TravelItemPurchaseForm = () => {
  const {itemId} = useParams();
  const [item, setItem] = useState(null);
  const [user, setUser] = useState(null);
  const [userCoupons, setUserCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [formData, setFormData] = useState({count: 1});

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await fetchTravelItemDetail(itemId);
        setItem(data);
        fetchUserData(data.price);
      } catch (error) {
        console.error('상품 정보를 가져오는 중 오류 발생:', error);
      }
    };

    const fetchUserData = async itemPrice => {
      try {
        const userData = await authAPI.getUserProfile();
        setUser(userData);
        const coupons = await fetchUserCoupons(userData._id);

        const validCoupons = coupons.filter(
          coupon =>
            !coupon.isUsed &&
            coupon.coupon.minPurchaseAmount <= itemPrice * formData.count
        );

        setUserCoupons(validCoupons);
      } catch (error) {
        console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      }
    };

    fetchItem();
  }, [itemId, formData.count]);

  const handleCouponSelect = (coupon, discount) => {
    setSelectedCoupon(coupon);
    setDiscountAmount(discount);
  };

  const handlePayment = async () => {
    const totalPrice = item.price * formData.count;
    const finalPrice = totalPrice - discountAmount;
    const merchant_uid = `travelItem_${Date.now()}`;

    try {
      const bookingResponse = await createBooking({
        types: ['travelItem'],
        productIds: [item._id],
        counts: [formData.count],
        merchant_uid,
        totalPrice,
        discountAmount,
        userId: user._id,
        couponId: selectedCoupon ? selectedCoupon._id : null,
        reservationInfo: {
          name: user.username,
          email: user.email,
          phone: user.phone,
          address: user.address
        }
      });

      if (!bookingResponse || !bookingResponse.booking) {
        throw new Error('예약 생성 실패');
      }
    } catch (error) {
      alert('예약 요청 중 오류가 발생했습니다.');
      return;
    }

    const {IMP} = window;
    IMP.init('imp22685348');

    IMP.request_pay(
      {
        pg: 'html5_inicis.INIpayTest',
        pay_method: 'card',
        merchant_uid: merchant_uid,
        name: item.name,
        amount: finalPrice,
        buyer_email: user.email,
        buyer_name: user.username,
        buyer_tel: user.phone,
        buyer_addr: user.address
      },
      async rsp => {
        if (rsp.success) {
          try {
            const verifyResponse = await verifyPayment({
              imp_uid: rsp.imp_uid,
              merchant_uid,
              couponId: selectedCoupon ? selectedCoupon._id : null,
              userId: user._id
            });

            if (verifyResponse.message === '결제 검증 성공') {
              alert('✅ 구매가 완료되었습니다.');
            } else {
              alert(`❌ 결제 검증 실패: ${verifyResponse.message}`);
            }
          } catch (error) {
            alert('❌ 결제 검증 중 오류가 발생했습니다.');
          }
        } else {
          alert(`❌ 결제 실패: ${rsp.error_msg}`);
        }
      }
    );
  };

  if (!item || !user) {
    return <p>⏳ 상품 정보를 불러오는 중...</p>;
  }

  return (
    <div className="purchase-form">
      <h3>상품명: {item.name}</h3>
      <p>가격: {item?.price ? item.price.toLocaleString() : '가격 정보 없음'} 원</p>

      <label>구매 수량</label>
      <input
        type="number"
        name="count"
        value={formData.count}
        min="1"
        max={item.stock || 50}
        onChange={e => setFormData({...formData, count: e.target.value})}
      />

      <CouponSelector
        userCoupons={userCoupons}
        itemPrice={item.price}
        count={formData.count}
        onCouponSelect={handleCouponSelect}
      />

      <p>
        최종 결제 금액: {(item.price * formData.count - discountAmount).toLocaleString()}{' '}
        원
      </p>

      <button onClick={handlePayment} className="payment-btn">
        🛒 결제하기
      </button>
    </div>
  );
};

export default TravelItemPurchaseForm;
