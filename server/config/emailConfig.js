const nodemailer = require('nodemailer');

// 이메일 발송 설정
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // SSL (보안 전송)
  secure: true, // true는 SSL 사용, false는 STARTTLS 사용
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * 비밀번호 재설정 이메일 전송 함수
 * @param {string} email 수신자 이메일
 * @param {string} token 비밀번호 재설정 토큰
 */
const sendResetPasswordEmail = async (email, token) => {
  try {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Our Real Trip Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '비밀번호 재설정 요청',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>비밀번호 재설정 안내 메일</h2>
          <p>안녕하세요.</p>
          <p>비밀번호를 재설정하려면 아래 링크를 클릭하세요:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" style="
              background-color: #4CAF50;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 5px;
              font-size: 18px;
            ">비밀번호 재설정</a>
          </p>
          <br />
          <p>이 링크는 <b>1시간</b> 동안 유효합니다.</p>
          <p>감사합니다.<br>Our Real Trip 팀</p>
        </div>
      `
    };

    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);
    console.log(`이메일 전송 성공: ${info.response}`);
  } catch (error) {
    console.error(`이메일 전송 실패: ${error.message}`);
    throw new Error('이메일을 전송하는 중 오류가 발생했습니다.');
  }
};

module.exports = sendResetPasswordEmail;
