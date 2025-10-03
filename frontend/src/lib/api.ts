import axios from "axios";
import { error } from "console";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if(typeof window !== 'undefined'){
        const token = localStorage.getItem('chat-token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
    };
    return config;
});


// Handle auth errors
api.interceptors.response.use(
    (response) => response, (error) => {
            if(error.response.status === 401){
                if(typeof window !== 'undefined'){
                    localStorage.removeItem('chat-token')
                    localStorage.removeItem('chat-user')
                    window.location.href = '/login'
                }
            }
        return Promise.reject(error)
    }
);


// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),
  logout: () => api.post('/auth/logout'),
}

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id: string) => api.get(`/users/${id}`),
  getMyProfile: () => api.get('/users/me'),
  getAdmin: () => api.get('/users/admin'),
}

// Rooms API
export const roomsAPI = {
    getRooms: ()=> api.get('/rooms'),
    getRoom: (id: string) => api.get(`/rooms/${id}`),
    createRoom: (data: { name: string; description?: string; isPublic?: boolean})=>{
        api.post('/rooms/', data)
    },
    joinRoom: (id: string) => api.post(`/rooms/${id}/join`),
    leaveRoom: (id: string) => api.post(`/rooms/${id}/leave`),
    getMyRooms: () => api.get('/rooms/my-rooms')
}

// Message API
export const messageAPI = {
    sendMessage: (data: FormData) => api.post('/messages', data),
    getRoomMessages: (roomId: string, page?: number, limit?: number) => 
        api.get(`/messages/room/${roomId}?page=${page}&limit=${limit}`),
    getDirectMessages: (userId: string, page?: number, limit?: number) => 
        api.get(`/messages/direct/${userId}?page=${page}&limit=${limit}`),
    getConversation: () => api.get('/messages/conversations')
}


// Notifications API
export const notificationsAPI = {
  getNotifications: (page?: number, limit?: number) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// Search API
export const searchAPI = {
  searchMessages: (query: string, roomId?: string) =>
    api.get(`/search/messages?q=${query}${roomId ? `&roomId=${roomId}` : ''}`),
  searchUsers: (query: string) => api.get(`/search/users?q=${query}`),
  searchRooms: (query: string) => api.get(`/search/rooms?q=${query}`),
}

