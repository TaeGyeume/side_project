import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/styles/Footer.css";

const Footer = () => {
  const [language, setLanguage] = useState("한국어");
  const languages = [
    "한국어", "English", "Español", "Français", "Deutsch", "Italiano",
    "Português", "日本語", "中文", "Türkçe", "русский", "Svenska", "ภาษาไทย",
    "Filipino", "中文(简体)", "中文(繁體)", "हिन्दी", "বাংলা", "ગુજરાતી",
    "मराठी", "ਪੰਜਾਬੀ", "Slovenčina", "தமிழ்", "తెలుగు"
  ];
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <footer className="footer bg-white text-muted py-3 mt-5 border-top">
      <div className="container text-center">
        <ul className="list-inline mb-1">
          <li className="list-inline-item">
            <a href="/meta" className="text-muted text-decoration-none">Meta</a>
          </li>
          <li className="list-inline-item">
            <a href="/about" className="text-muted text-decoration-none">소개</a>
          </li>
          <li className="list-inline-item">
            <a href="/blog" className="text-muted text-decoration-none">블로그</a>
          </li>
          <li className="list-inline-item">
            <a href="/jobs" className="text-muted text-decoration-none">채용 정보</a>
          </li>
          <li className="list-inline-item">
            <a href="/help" className="text-muted text-decoration-none">도움말</a>
          </li>
          <li className="list-inline-item">
            <a href="/api" className="text-muted text-decoration-none">API</a>
          </li>
          <li className="list-inline-item">
            <a href="/privacy" className="text-muted text-decoration-none">개인정보처리방침</a>
          </li>
          <li className="list-inline-item">
            <a href="/terms" className="text-muted text-decoration-none">약관</a>
          </li>
          <li className="list-inline-item">
            <a href="/locations" className="text-muted text-decoration-none">위치</a>
          </li>
          <li className="list-inline-item">
            <a href="/lite" className="text-muted text-decoration-none">Instagram Lite</a>
          </li>
          <li className="list-inline-item">
            <a href="/threads" className="text-muted text-decoration-none">Threads</a>
          </li>
          <li className="list-inline-item">
            <a href="/upload" className="text-muted text-decoration-none">연락처 업로드 & 비사용자</a>
          </li>
          <li className="list-inline-item">
            <a href="/meta-verified" className="text-muted text-decoration-none">Meta Verified</a>
          </li>
        </ul>
        <div className="d-flex justify-content-center align-items-center mt-2">
          {/* 언어 선택 드롭다운 */}
          <select
            value={language}
            onChange={handleLanguageChange}
            className="form-select d-inline-block"
            style={{ width: "150px", fontSize: "0.875rem" }}
          >
            {languages.map((lang, index) => (
              <option key={index} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>
            © 2025 Instagram from Meta
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
