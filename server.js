const express = require('express');
const cors = require('cors');
const app = express();

// ...existing code...

// CORS 설정 추가
app.use(cors({
    origin: 'http://localhost:3000', // 허용할 도메인
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// ...existing code...

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
