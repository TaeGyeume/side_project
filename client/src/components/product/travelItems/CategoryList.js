import {useEffect, useState} from 'react';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories/allCategories')
      .then(res => res.json())
      .then(data => setCategories(data.categories))
      .catch(err => console.error('카테고리 불러오기 실패:', err));
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">카테고리 목록</h2>
      <ul className="space-y-2">
        {categories.length > 0 ? (
          categories.map(cat => (
            <li key={cat._id} className="p-2 border-b">
              {cat.name} {cat.parentCategory && ` (상위: ${cat.parentCategory.name})`}
            </li>
          ))
        ) : (
          <p>카테고리가 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default CategoryList;
