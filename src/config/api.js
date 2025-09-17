// API Configuration for Teacher Portal
const API_CONFIG = {
  // Use deployed AWS backend
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'http://54.197.165.209:3001' 
    : 'http://54.197.165.209:3001',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      ME: '/api/auth/me',
      PROFILE: '/api/auth/profile',
      CHANGE_PASSWORD: '/api/auth/change-password'
    },
    EVENTS: {
      LIST: '/api/events',
      CREATE: '/api/events',
      DETAILS: '/api/events',
      UPDATE: '/api/events',
      DELETE: '/api/events',
      PARTICIPANTS: '/api/events'
    },
    TEACHERS: {
      DASHBOARD: '/api/teachers/dashboard',
      STATS: '/api/teachers/stats'
    }
  }
};

export default API_CONFIG;
