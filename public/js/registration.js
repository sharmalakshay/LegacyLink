document.getElementById('registration-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        alert('Registration successful');
        // Redirect to login page or dashboard
        window.location.href = '/login'; // Redirect to login page
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed');
    }
});