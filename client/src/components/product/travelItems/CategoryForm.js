import {useState} from 'react';

const CategoryForm = ({onCreate}) => {
  const [name, setName] = useState('');
  const [parentCategory, setParentCategory] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name) return alert('카테고리 이름을 입력하세요!');

    const newCategory = {name, parentCategory: parentCategory || null};
    onCreate(newCategory);
    setName('');
    setParentCategory('');
  };

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">카테고리 추가</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="카테고리 이름"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="상위 카테고리 ID (선택)"
          value={parentCategory}
          onChange={e => setParentCategory(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          추가
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;
