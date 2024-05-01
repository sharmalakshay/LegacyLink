document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            throw new Error('Login failed');
        }
        alert('Login successful');
        // Redirect to dashboard or user profile page
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('register-button');
    registerButton.addEventListener('click', function () {
        window.location.href = "/registration";
    });
});
