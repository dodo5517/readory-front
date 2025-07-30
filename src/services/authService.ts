const API_BASE_URL = 'http://localhost:8080';

// 일반 회원가입(POST)
export async function registerUser(email: string, username: string, password: string) {
    console.log('RegisterUser');

    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    });
    
    if (!response.ok) {
        throw new Error("회원가입 실패");
    }

    return await response.json();
}

// 로그인(POST)
export async function loginUser(email: string, password: string) {
    console.log("loginUser")

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("로그인 실패");
    }

    return await response.json(); // accessToken 반환 포함한 상태임
}