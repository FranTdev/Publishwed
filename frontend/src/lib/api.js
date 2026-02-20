const API_BASE = 'http://127.0.0.1:8000';

export const getAuthToken = () => localStorage.getItem('access_token');
export const setAuthToken = (token) => localStorage.setItem('access_token', token);
export const removeAuthToken = () => localStorage.removeItem('access_token');

export const fetchApi = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is FormData, don't set Content-Type header (browser sets it with boundary marker)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        removeAuthToken();
        window.location.href = '/login'; // simple redirect on unauthorized
        throw new Error('Unauthorized');
    }

    if (response.status === 204) {
        return null; // Handle 204 No Content safely instead of parsing JSON
    }

    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch (e) { }
        throw new Error(errorData.detail || JSON.stringify(errorData) || `Request failed with status ${response.status}`);
    }

    return response.json();
};

export const api = {
    login: (formData) => fetchApi('/login', { method: 'POST', body: formData }),
    register: (data) => fetchApi('/users/', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => fetchApi('/users/me/'),
    getMessages: () => fetchApi('/messages/'),
    createMessage: (data) => fetchApi('/messages/', { method: 'POST', body: JSON.stringify(data) }),
    updateMessage: (id, data) => fetchApi(`/messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMessage: (id) => fetchApi(`/messages/${id}`, { method: 'DELETE' }),
    getComments: (messageId) => fetchApi(`/messages/${messageId}/comments/`),
    createComment: (data) => fetchApi('/comments/', { method: 'POST', body: JSON.stringify(data) }),
    updateComment: (id, data) => fetchApi(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteComment: (id) => fetchApi(`/comments/${id}`, { method: 'DELETE' }),
};
