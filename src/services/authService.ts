const API_BASE_URL = 'http://localhost:8080';

// 로그인(POST)
export async function loginUser(email: string, password: string) {
    console.log("loginUser 실행됨")

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('로그인 실패');
    }

    return await response.json(); // accessToken 반환 포함한 상태임
}
