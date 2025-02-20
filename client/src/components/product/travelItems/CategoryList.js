import React, {useState} from 'react';
import {
  updateTopLevelCategory,
  updateSubCategory,
  deleteCategory
} from '../../../api/travelItem/travelItemService';

const CategoryList = ({categories, refreshCategories}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState('');

  // ✅ 특정 카테고리 클릭 시 하위 카테고리 표시 토글
  const toggleCategory = categoryId => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId] // 기존 상태 반전 (true ↔ false)
    }));
  };

  // ✅ 카테고리 수정 시작 (입력창 활성화)
  const startEditing = (categoryId, currentName) => {
    setEditingCategory(categoryId);
    setEditedName(currentName);
  };

  // ✅ 카테고리 수정 저장 (수정 후 페이지 리로드)
  const saveCategoryEdit = async categoryId => {
    try {
      if (!editedName.trim()) {
        alert('카테고리 이름을 입력해주세요.');
        return;
      }

      const category = categories.find(cat => cat._id === categoryId);
      if (!category) return;

      if (!category.parentCategory) {
        await updateTopLevelCategory(categoryId, {name: editedName});
      } else {
        await updateSubCategory(categoryId, {name: editedName});
      }

      setEditingCategory(null);

      // ✅ 수정 후 페이지 리로드
      window.location.reload();
    } catch (error) {
      console.error('❌ 카테고리 수정 실패:', error);
    }
  };

  // ✅ 카테고리 삭제 (삭제 후 페이지 리로드)
  const handleDelete = async categoryId => {
    if (window.confirm('정말 이 카테고리를 삭제하시겠습니까?')) {
      try {
        await deleteCategory(categoryId);

        // ✅ 삭제 후 페이지 리로드
        window.location.reload();
      } catch (error) {
        console.error('❌ 카테고리 삭제 실패:', error);
      }
    }
  };

  return (
    <div>
      {categories.length > 0 ? (
        <ul className="list-group">
          {categories
            .filter(cat => !cat.parentCategory) // 최상위 카테고리만 필터링
            .map(cat => (
              <li key={cat._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  {/* ✅ 카테고리명 표시 또는 수정 입력창 */}
                  {editingCategory === cat._id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      onBlur={() => saveCategoryEdit(cat._id)}
                      onKeyDown={e => e.key === 'Enter' && saveCategoryEdit(cat._id)}
                      autoFocus
                      className="form-control"
                    />
                  ) : (
                    <span
                      onClick={() => toggleCategory(cat._id)}
                      style={{cursor: 'pointer'}}>
                      {cat.name} {expandedCategories[cat._id] ? '🔽' : '▶'}
                    </span>
                  )}

                  {/* ✅ 수정 및 삭제 버튼 */}
                  <div>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => startEditing(cat._id, cat.name)}>
                      📝 수정
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(cat._id)}>
                      🗑 삭제
                    </button>
                  </div>
                </div>

                {/* ✅ 하위 카테고리 목록 */}
                {expandedCategories[cat._id] &&
                  categories
                    .filter(subCat => subCat.parentCategory?._id === cat._id)
                    .map(subCat => (
                      <ul key={subCat._id} className="list-group mt-2">
                        <li className="list-group-item ms-4 d-flex justify-content-between align-items-center">
                          {/* ✅ 하위 카테고리명 표시 또는 수정 입력창 */}
                          {editingCategory === subCat._id ? (
                            <input
                              type="text"
                              value={editedName}
                              onChange={e => setEditedName(e.target.value)}
                              onBlur={() => saveCategoryEdit(subCat._id)}
                              onKeyDown={e =>
                                e.key === 'Enter' && saveCategoryEdit(subCat._id)
                              }
                              autoFocus
                              className="form-control"
                            />
                          ) : (
                            <span>{subCat.name}</span>
                          )}

                          {/* ✅ 수정 및 삭제 버튼 */}
                          <div>
                            <button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => startEditing(subCat._id, subCat.name)}>
                              📝 수정
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(subCat._id)}>
                              🗑 삭제
                            </button>
                          </div>
                        </li>
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
