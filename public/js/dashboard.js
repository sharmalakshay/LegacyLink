document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/dashboard/profile', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        // Do something with the data here
        // For example, display it on the page
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
        // If the fetch fails, redirect to the login page
        window.location.href = '/login';
    }
});

function logout() {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    window.location.href = '/logout';
}