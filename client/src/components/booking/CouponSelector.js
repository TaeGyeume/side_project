import React, {useState, useEffect} from 'react';

const CouponSelector = ({userCoupons, itemPrice, count, onCouponSelect}) => {
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (selectedCoupon) {
      setDiscountAmount(calculateDiscount(selectedCoupon));
    }
  }, [selectedCoupon, count]);

  const calculateDiscount = coupon => {
    if (!coupon) return 0;

    let discount = 0;
    const originalPrice = itemPrice * count;

    if (coupon.coupon.discountType === 'percentage') {
      discount = (originalPrice * coupon.coupon.discountValue) / 100;

      if (coupon.coupon.maxDiscountAmount > 0) {
        discount = Math.min(discount, coupon.coupon.maxDiscountAmount);
      }
    } else if (coupon.coupon.discountType === 'fixed') {
      discount = coupon.coupon.discountValue || 0;
    }

    return discount;
  };

  const handleCouponChange = event => {
    const coupon = userCoupons.find(c => c._id === event.target.value);
    setSelectedCoupon(coupon);
    setDiscountAmount(calculateDiscount(coupon));
    onCouponSelect(coupon, calculateDiscount(coupon));
  };

  return (
    <div>
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
    </div>
  );
};

export default CouponSelector;
