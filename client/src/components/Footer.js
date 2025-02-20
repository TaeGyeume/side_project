import React from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {FaFacebookF, FaInstagram, FaYoutube, FaApple, FaGooglePlay} from 'react-icons/fa';
import useChannelTalk from '../hooks/useChannelTalk';
import './styles/Footer.css';

const Footer = () => {
  const toggleChannelTalk = useChannelTalk();
  return (
    <footer className="footer">
      <Container>
        {/* 첫 번째 줄: 고객지원 및 소개 */}
        <Row className="footer-top">
          <Col md={4}>
            <h5>고객지원실 운영안내</h5>
            <p>채팅상담 연중무휴 24시간</p>
            <p>유선상담 연중무휴 09:00~18:00</p>
            <p>대표번호 1670-8208</p>
            <p>✈ 항공권 환불 - 연중무휴 09:00~17:00 접수 가능</p>
            <p>✈ 항공권 변경 - 평일 09:00~17:00 접수 가능</p>
            <Button variant="primary" className="chat-btn" onClick={toggleChannelTalk}>
              1:1 채팅상담
            </Button>
          </Col>

          <Col md={2}>
            <h5>소개</h5>
            <ul>
              <li>
                <a href="#">회사소개</a>
              </li>
              <li>
                <a href="#">채용</a>
              </li>
              <li>
                <a href="#">광고</a>
              </li>
            </ul>
          </Col>

          <Col md={2}>
            <h5>파트너</h5>
            <ul>
              <li>
                <a href="#">파트너 홈</a>
              </li>
              <li>
                <a href="#">제휴 문의</a>
              </li>
              <li>
                <a href="#">광고 문의</a>
              </li>
            </ul>
          </Col>

          <Col md={2}>
            <h5>지원</h5>
            <ul>
              <li>
                <a href="#">공지사항/FAQ</a>
              </li>
              <li>
                <a href="#">최저가 보장제</a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* 두 번째 줄: 이용약관 및 회사정보 */}
        <Row className="footer-middle">
          <Col>
            <ul className="footer-links">
              <li>
                <a href="#">이용 약관</a>
              </li>
              <li>
                <a href="#">개인정보 처리방침</a>
              </li>
              <li>
                <a href="#">취소 및 환불 정책</a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* 세 번째 줄: 회사 정보 */}
        <Row className="footer-bottom">
          <Col>
            <p>
              상호명 (주)우리리얼트립 | 대표 김우리 | 개인정보보호책임자 김민혁 |
              사업자등록번호 2*9-**-55*39
              <br /> 주소 서울특별시 서초구 강남대로 3*1 (한화생명보험빌딩)
              <br /> 이메일 help@ourrealtrip.com | 마케팅 문의 marketing@ourrealtrip.com
            </p>
            <p>
              자사는 서울특별시관광협회 공제영업보증보험에 가입되어 있습니다.
              영업보증보험: 1.5억원 / 기획여행보증: 2억원
            </p>
          </Col>
        </Row>

        {/* 네 번째 줄: 소셜 미디어 아이콘 */}
        <Row className="footer-social">
          <Col>
            <FaFacebookF className="social-icon" />
            <FaInstagram className="social-icon" />
            <FaYoutube className="social-icon" />
            <FaApple className="social-icon" />
            <FaGooglePlay className="social-icon" />
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
