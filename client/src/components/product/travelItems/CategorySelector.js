import React from 'react';
import {FormControl, InputLabel, Select, MenuItem, Box, Stack} from '@mui/material';

const CategorySelector = ({
  topCategories,
  subCategories,
  selectedTopCategory,
  selectedSubCategory,
  onTopCategoryChange,
  onSubCategoryChange
}) => {
  return (
    <Box sx={{maxWidth: 800, mx: 'auto', mt: 3, mb: 4}}>
      {' '}
      {/* 아래쪽 마진 추가 */}
      <Stack direction="row" spacing={3} alignItems="center">
        {' '}
        {/* 한 줄 정렬 */}
        {/* 최상위 카테고리 선택 */}
        <FormControl fullWidth>
          <InputLabel shrink>최상위 카테고리</InputLabel>
          <Select
            label="최상위 카테고리"
            variant="outlined"
            value={selectedTopCategory}
            onChange={e => onTopCategoryChange(e.target.value)}
            displayEmpty
            renderValue={selected =>
              selected
                ? topCategories.find(cat => cat._id === selected)?.name
                : '최상위 카테고리 선택'
            } // 기본값을 처리하여 겹침 방지
          >
            <MenuItem value="">최상위 카테고리 선택</MenuItem>
            {topCategories.map(cat => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* 하위 카테고리 선택 (최상위 선택 시만 표시) */}
        {subCategories.length > 0 && (
          <FormControl fullWidth>
            <InputLabel shrink>하위 카테고리</InputLabel>
            <Select
              label="하위 카테고리"
              value={selectedSubCategory}
              onChange={e => onSubCategoryChange(e.target.value)}
              displayEmpty
              renderValue={selected =>
                selected
                  ? subCategories.find(cat => cat._id === selected)?.name
                  : '하위 카테고리 선택'
              } // 기본값을 처리하여 겹침 방지
            >
              <MenuItem value="">하위 카테고리 선택</MenuItem>
              {subCategories.map(subCat => (
                <MenuItem key={subCat._id} value={subCat._id}>
                  {subCat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </Box>
  );
};

export default CategorySelector;
