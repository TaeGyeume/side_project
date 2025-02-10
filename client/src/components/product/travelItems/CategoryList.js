import React, {useState} from 'react';

const CategoryList = ({categories}) => {
  const [expandedCategories, setExpandedCategories] = useState({}); // 드롭다운 상태

  // ✅ 특정 카테고리 클릭 시 하위 카테고리 표시 토글
  const toggleCategory = categoryId => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId] // 기존 상태 반전 (true ↔ false)
    }));
  };

  return (
    <div>
      {categories.length > 0 ? (
        <ul className="list-group">
          {categories
            .filter(cat => !cat.parentCategory) // 최상위 카테고리만 필터링
            .map(cat => (
              <li key={cat._id} className="list-group-item">
                <div
                  className="d-flex justify-content-between align-items-center"
                  onClick={() => toggleCategory(cat._id)}
                  style={{cursor: 'pointer'}}>
                  <span>{cat.name}</span>
                  <span>{expandedCategories[cat._id] ? '🔽' : '▶'}</span>
                </div>

                {/* ✅ 하위 카테고리 목록 */}
                {expandedCategories[cat._id] &&
                  categories
                    .filter(subCat => subCat.parentCategory?._id === cat._id)
                    .map(subCat => (
                      <ul key={subCat._id} className="list-group mt-2">
                        <li className="list-group-item ms-4">{subCat.name}</li>
                      </ul>
                    ))}
              </li>
            ))}
        </ul>
      ) : (
        <p>카테고리가 없습니다.</p>
      )}
    </div>
  );
};

export default CategoryList;
