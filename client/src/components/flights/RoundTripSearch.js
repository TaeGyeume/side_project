import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import moment from 'moment-timezone';
import './styles/FlightSearch.css';
import {searchFlights} from '../../api/flight/flights';
import LoadingScreen from './LoadingScreen';

import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  OutlinedInput,
  TextField,
  IconButton,
  Alert,
  Stack
} from '@mui/material';
import {LocalizationProvider, DatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {ko} from 'date-fns/locale';
import {Add, Remove} from '@mui/icons-material';

// ✅ 공항 한글 → 코드 변환
const AIRPORT_CODES = {
  서울: 'GMP',
  인천: 'ICN',
  부산: 'PUS',
  제주: 'CJU',
  대구: 'TAE',
  광주: 'KWJ',
  청주: 'CJJ',
  여수: 'RSU',
  무안: 'MWX'
};

const AIRPORT_LIST = Object.keys(AIRPORT_CODES);

const RoundTripSearch = () => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [passengers, setPassengers] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    console.log('🔍 왕복 검색 요청:', {
      departure,
      arrival,
      departureDate,
      returnDate,
      passengers
    });

    if (!departure || !arrival || !departureDate || !returnDate || passengers < 1) {
      setErrorMessage('출발지, 도착지, 출발 날짜, 오는 날짜, 인원수를 입력해주세요.');
      return;
    }

    const deptCode = AIRPORT_CODES[departure] || departure;
    const arrCode = AIRPORT_CODES[arrival] || arrival;
    const formattedDepartureDate = moment(departureDate, 'YYYY-MM-DD', true).format(
      'YYYY-MM-DD'
    );
    const formattedReturnDate = moment(returnDate, 'YYYY-MM-DD', true).format(
      'YYYY-MM-DD'
    );

    if (
      !moment(formattedDepartureDate, 'YYYY-MM-DD', true).isValid() ||
      !moment(formattedReturnDate, 'YYYY-MM-DD', true).isValid()
    ) {
      setErrorMessage('🚨 잘못된 날짜 형식입니다. YYYY-MM-DD 형식이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      console.log(`✅ 출발편 검색 날짜: ${formattedDepartureDate}`);
      const departureFlights = await searchFlights(
        deptCode,
        arrCode,
        formattedDepartureDate,
        passengers
      );

      if (!departureFlights || departureFlights.length === 0) {
        setErrorMessage(
          `🚫 출발편 (${formattedDepartureDate})에 운항하는 항공편이 없습니다.`
        );
        setLoading(false);
      } else {
        setErrorMessage('');
        console.log('✅ 출발편 검색 완료:', departureFlights);

        // ✅ 500ms 딜레이 후 navigate 실행 (로딩 화면이 보이도록)
        setTimeout(() => {
          setLoading(false);
          navigate('/flights/roundtrip-departure', {
            state: {
              departureFlights,
              returnDate: formattedReturnDate,
              passengers,
              deptCode,
              arrCode
            }
          });
        }, 500);
      }
    } catch (error) {
      console.error('🚨 검색 실패:', error);
      setErrorMessage('🚨 검색 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Paper elevation={3} sx={{p: 3, mt: 4}}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🔄 왕복 항공편 검색
        </Typography>

        {/* ✅ 입력 필드 배치 (수평 정렬) */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* 출발 공항 */}
          <FormControl sx={{flex: 1, minWidth: '150px'}} variant="outlined">
            <InputLabel>출발지가 어디인가요?</InputLabel>
            <Select
              value={departure}
              onChange={e => setDeparture(e.target.value)}
              label="출발지가 어디인가요?">
              {AIRPORT_LIST.map(airport => (
                <MenuItem key={airport} value={airport}>
                  {airport}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 도착 공항 */}
          <FormControl sx={{flex: 1, minWidth: '150px'}} variant="outlined">
            <InputLabel>도착지가 어디인가요?</InputLabel>
            <Select
              value={arrival}
              onChange={e => setArrival(e.target.value)}
              label="도착지가 어디인가요?">
              {AIRPORT_LIST.map(airport => (
                <MenuItem key={airport} value={airport}>
                  {airport}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 출발 날짜 */}
          <DatePicker
            label="가는 날"
            value={departureDate}
            onChange={newValue => setDepartureDate(newValue)}
            sx={{width: '200px'}}
            renderInput={params => <TextField {...params} fullWidth />}
          />

          {/* 도착 날짜 */}
          <DatePicker
            label="오는 날"
            value={returnDate}
            onChange={newValue => setReturnDate(newValue)}
            sx={{width: '200px'}}
            renderInput={params => <TextField {...params} fullWidth />}
          />

          {/* 인원 선택 */}
          <FormControl sx={{flex: 1, minWidth: '160px'}}>
            <InputLabel shrink htmlFor="passengers">
              인원수
            </InputLabel>
            <OutlinedInput
              id="passengers"
              notched
              label="인원수"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '56px',
                padding: '0 8px', // 내부 패딩 조정
                borderRadius: '5px'
              }}
              startAdornment={
                <IconButton
                  onClick={() => setPassengers(prev => Math.max(1, prev - 1))}
                  size="small"
                  sx={{padding: '4px'}} // 버튼 크기 줄임
                >
                  <Remove fontSize="small" />
                </IconButton>
              }
              endAdornment={
                <IconButton
                  onClick={() => setPassengers(prev => prev + 1)}
                  size="small"
                  sx={{padding: '4px'}} // 버튼 크기 줄임
                >
                  <Add fontSize="small" />
                </IconButton>
              }
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  width: '24px' // 숫자가 중앙 정렬되도록 조정
                }
              }}
              value={passengers}
              readOnly
            />
          </FormControl>

          {/* 검색 버튼 */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{minWidth: '120px', height: '56px'}}>
            검색
          </Button>
        </Stack>

        {/* 에러 메시지 */}
        {errorMessage && (
          <Alert severity="error" sx={{mt: 2}}>
            {errorMessage}
          </Alert>
        )}

        {/* 로딩 화면 */}
        {loading && <LoadingScreen />}
      </Paper>
    </LocalizationProvider>
  );
};

export default RoundTripSearch;
