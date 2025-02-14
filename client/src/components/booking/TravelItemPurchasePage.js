import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {fetchTravelItemDetail} from '../../api/travelItem/travelItemService';
import {createBooking, verifyPayment} from '../../api/booking/bookingService';
import {fetchUserCoupons} from '../../api/coupon/couponService';
import {authAPI} from '../../api/auth/index';

const TravelItemPurchaseForm = () => {
  const {itemId} = useParams();
  const [item, setItem] = useState(null);
  const [user, setUser] = useState(null);
  const [userCoupons, setUserCoupons] = useState([]); // 사용자 쿠폰 목록
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [formData, setFormData] = useState({count: 1});

  useEffect(() => {
    // ✅ 여행용품 정보 가져오기
    const fetchItem = async () => {
      try {
        const data = await fetchTravelItemDetail(itemId);
        setItem(data);

        // ✅ 아이템 정보가 로드된 후 사용자 데이터 가져오기
        fetchUserData(data.price);
      } catch (error) {
        console.error('상품 정보를 가져오는 중 오류 발생:', error);
      }
    };

    // ✅ 현재 로그인한 사용자 정보 & 사용 가능한 쿠폰 가져오기
    const fetchUserData = async itemPrice => {
      try {
        const userData = await authAPI.getUserProfile();
        setUser(userData);
        const coupons = await fetchUserCoupons(userData._id);

        // ✅ 사용되지 않은(isUsed === false) & 최소 구매 금액 충족하는 쿠폰만 필터링
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
  }, [itemId, formData.count]); // ✅ 아이템 가격이 변경될 때마다 다시 필터링 실행

  // ✅ 할인 금액 계산 로직
  const calculateDiscount = selectedCoupon => {
    if (!selectedCoupon || !item) return 0;

    let discount = 0;
    const originalPrice = item.price * formData.count; // ✅ 원래 총 가격

    if (selectedCoupon.coupon.discountType === 'percentage') {
      discount = (originalPrice * selectedCoupon.coupon.discountValue) / 100;

      if (selectedCoupon.coupon.maxDiscountAmount > 0) {
        discount = Math.min(discount, selectedCoupon.coupon.maxDiscountAmount);
      }
    } else if (selectedCoupon.coupon.discountType === 'fixed') {
      discount = selectedCoupon.coupon.discountValue || 0;
    }

    console.log('📌 [클라이언트] 할인 금액 계산:', {
      originalPrice,
      discount,
      finalPrice: originalPrice - discount
    });

    return discount;
  };

  // ✅ 쿠폰 선택 핸들러
  const handleCouponChange = event => {
    const coupon = userCoupons.find(c => c._id === event.target.value);
    setSelectedCoupon(coupon);
    setDiscountAmount(calculateDiscount(coupon));
  };

  // ✅ 결제 요청 로직
  const handlePayment = async () => {
    const totalPrice = item.price * formData.count;
    const finalPrice = totalPrice - discountAmount;

    const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // 한국 시간
    const formattedDate = now
      .toISOString()
      .slice(2, 19) // YYMMDDTHHMMSS
      .replace(/[-T:]/g, ''); // YYMMDDHHMMSS

    const merchant_uid = `${user.username}_${formattedDate}`;

    console.log('📌 [클라이언트] 결제 요청 데이터:', {
      itemId: item._id,
      totalPrice,
      discountAmount,
      finalPrice,
      couponId: selectedCoupon ? selectedCoupon._id : null
    });

    try {
      // ✅ 예약 생성 요청
      const bookingResponse = await createBooking({
        types: ['travelItem'], // ✅ 상품 타입 추가
        productIds: [item._id], // ✅ 상품 ID 추가
        counts: [formData.count], // ✅ 수량 추가
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

      console.log('📌 [클라이언트] 예약 응답:', bookingResponse);

      if (!bookingResponse || !bookingResponse.booking) {
        throw new Error('예약 생성 실패');
      }
    } catch (error) {
      alert('예약 요청 중 오류가 발생했습니다.');
      return;
    }

    // ✅ 포트원 결제 요청
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
            console.log('📌 [클라이언트] 결제 검증 요청 데이터:', {
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

      <label>쿠폰 선택</label>
      <select onChange={handleCouponChange}>
        <option value="">쿠폰 선택 안함</option>
        {userCoupons.map(coupon => (
          <option key={coupon._id} value={coupon._id}>
            {coupon.coupon.discountValue
              ? `${coupon.coupon.name} (${coupon.coupon.discountValue}${
                  coupon.coupon.discountType === 'percentage' ? '%' : '원'
                } 할인)`
              : '(할인 정보 없음)'}
          </option>
        ))}
      </select>

      <p>할인 금액: {discountAmount.toLocaleString()} 원</p>
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
