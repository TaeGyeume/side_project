import React from 'react';

const CategorySelector = ({
  topCategories,
  subCategories,
  selectedTopCategory,
  selectedSubCategory,
  onTopCategoryChange,
  onSubCategoryChange
}) => {
  return (
    <div className="mb-4">
      {/* ✅ 최상위 카테고리 선택 */}
      <label className="form-label">최상위 카테고리</label>
      <select
        className="form-select mb-3"
        value={selectedTopCategory}
        onChange={e => onTopCategoryChange(e.target.value)}>
        <option value="">최상위 카테고리 선택</option>
        {topCategories.map(cat => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* ✅ 하위 카테고리 선택 (최상위 선택 시만 표시) */}
      {subCategories.length > 0 && (
        <>
          <label className="form-label">하위 카테고리</label>
          <select
            className="form-select"
            value={selectedSubCategory}
            onChange={e => onSubCategoryChange(e.target.value)}>
            <option value="">하위 카테고리 선택</option>
            {subCategories.map(subCat => (
              <option key={subCat._id} value={subCat._id}>
                {subCat.name}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default CategorySelector;
