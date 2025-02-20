// src/components/accommodations/AccommodationSearch.js
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {TextField, Button, Box, Stack, InputAdornment} from '@mui/material';
import {CalendarToday, Person} from '@mui/icons-material';

const AccommodationSearch = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  adults,
  setAdults,
  onSearch
}) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 70,
        zIndex: 1000,
        padding: '10px 20px',
        backgroundColor: 'white',
        boxShadow: 3,
        borderRadius: '10px',
        maxWidth: '1300px', // 가로 크기 제한하여 정렬 개선
        margin: '0 auto' // 가운데 정렬
      }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center" // 전체 요소 중앙 정렬
        sx={{width: '100%'}}>
        {/* 체크인 날짜 선택 */}
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          customInput={
            <TextField
              fullWidth
              variant="outlined"
              label="체크인"
              sx={{minWidth: '180px'}}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          }
        />

        {/* 체크아웃 날짜 선택 */}
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          customInput={
            <TextField
              fullWidth
              variant="outlined"
              label="체크아웃"
              sx={{minWidth: '180px'}}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          }
        />

        {/* 성인 수 선택 (크기 조정) */}
        <TextField
          type="number"
          variant="outlined"
          label="성인"
          value={adults}
          onChange={e => setAdults(Number(e.target.value))}
          inputProps={{min: 1}}
          sx={{
            minWidth: '80px', // 크기 축소
            width: '160px', // 고정 크기
            textAlign: 'center'
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person fontSize="small" />
              </InputAdornment>
            )
          }}
        />

        {/* 검색 버튼 */}
        <Button
          variant="contained"
          color="primary"
          onClick={onSearch}
          sx={{
            fontWeight: 'bold',
            padding: '12px',
            fontSize: '16px',
            height: '56px',
            minWidth: '120px' // 버튼 크기 통일
          }}>
          🔍 검색
        </Button>
      </Stack>
    </Box>
  );
};

export default AccommodationSearch;
