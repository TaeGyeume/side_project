import React, {useState} from 'react';

const CouponForm = ({onSubmit}) => {
  const [coupon, setCoupon] = useState({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minPurchaseAmount: 0,
    applicableMemberships: [],
    expiresAt: ''
  });

  const membershipOptions = ['길초보', '길잡이', '모험왕'];

  const handleChange = e => {
    const {name, value} = e.target;
    setCoupon(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMembershipChange = membership => {
    setCoupon(prev => ({
      ...prev,
      applicableMemberships: prev.applicableMemberships.includes(membership)
        ? prev.applicableMemberships.filter(m => m !== membership)
        : [...prev.applicableMemberships, membership]
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(coupon);
  };

  return (
    <form onSubmit={handleSubmit} className="coupon-form">
      <label>쿠폰 이름</label>
      <input
        type="text"
        name="name"
        value={coupon.name}
        onChange={handleChange}
        required
      />

      <label>쿠폰 설명</label>
      <textarea name="description" value={coupon.description} onChange={handleChange} />

      <label>할인 유형</label>
      <select name="discountType" value={coupon.discountType} onChange={handleChange}>
        <option value="percentage">퍼센트 할인</option>
        <option value="fixed">정액 할인</option>
      </select>

      <label>할인 값</label>
      <input
        type="number"
        name="discountValue"
        value={coupon.discountValue}
        onChange={handleChange}
        required
      />

      {coupon.discountType === 'percentage' && (
        <>
          <label>최대 할인 금액</label>
          <input
            type="number"
            name="maxDiscountAmount"
            value={coupon.maxDiscountAmount}
            onChange={handleChange}
          />
        </>
      )}

      <label>최소 구매 금액</label>
      <input
        type="number"
        name="minPurchaseAmount"
        value={coupon.minPurchaseAmount}
        onChange={handleChange}
      />

      <label>적용 대상 멤버십</label>
      <div className="membership-options">
        {membershipOptions.map(membership => (
          <label key={membership}>
            <input
              type="checkbox"
              value={membership}
              checked={coupon.applicableMemberships.includes(membership)}
              onChange={() => handleMembershipChange(membership)}
            />
            {membership}
          </label>
        ))}
      </div>

      <label>쿠폰 만료일</label>
      <input
        type="datetime-local"
        name="expiresAt"
        value={coupon.expiresAt}
        onChange={handleChange}
        required
      />

      <button type="submit">쿠폰 생성</button>
    </form>
  );
};

export default CouponForm;
