// ...existing code...

const handleSubmit = async (event) => {
    event.preventDefault();
    // ...existing code...

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 필요한 경우 추가 헤더 설정
            },
            body: JSON.stringify({
                // ...request body...
            }),
            credentials: 'include', // 쿠키를 포함한 요청을 보내기 위해 추가
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Register success:', data);
        // ...existing code...
    } catch (error) {
        console.error('Register error:', error);
        // ...existing code...
    }
};

// ...existing code...
