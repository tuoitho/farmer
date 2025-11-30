const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const NEXT_PUBLIC_API_CLIENT = process.env.NEXT_PUBLIC_API_CLIENT;

export default {
    auth: {
        // POST: Login with credentials
        login: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/auth/login`,
        // POST: Register new user
        register: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/auth/register`,
        // POST: Refresh access token
        refreshToken: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/auth/refresh`,
        // POST: Logout and invalidate token
        logout: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/auth/logout`,
        // GET: Get current user profile
        getProfile: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/auth/profile`,
        // PUT: Update user profile
        updateProfile: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/auth/profile`,
        // PUT: Change password
        changePassword: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/auth/change-password`,
    },
    Farm: {
        // POST: Create a new farm
        createFarm: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/farms`,
        // GET: Get all farms for current user
        getFarms: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/farms`,
        // GET: Get farm details by ID
        getFarmById: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/farms/:farmId`,
        // PUT: Update farm information
        updateFarm: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/farms/:farmId`,
        // PUT: Update crop status for a farm
        updateCropStatus: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/farms/:farmId/status`,
        // DELETE: Delete a farm
        deleteFarm: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/farms/:farmId`,
    },
    Weather: {
        // GET: Get weather forecast
        getWeather: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/weather/forecast`,
        // GET: Get weather data for a specific farm
        getWeatherByFarm: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/weather/farm/:farmId`,
        // GET: Get weather advice for a specific farm
        getWeatherAdvice: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/weather/advice/farm/:farmId`,
    },
    AI: { //AI assistant
        // POST: Detect plant disease from image
        detectDisease: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/ai/detect-disease`,
        // POST: Chat with AI assistant
        chatWithAI: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/ai/chat`,
        // GET: Check if AI service is healthy
        checkAiHealth: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/ai/health`,
        // GET : History chat
        getHistoryChat: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/ai/chat-history`,
        // DELETE : Delete history chat
        deleteHistoryChat: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/ai/chat-history`,
        // POST: Chat with image
        chatWithImage: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/ai/chat-with-image`,
    },
    Notification: {
        // GET: Get all notifications for current user
        getNotifications: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/notifications`,
        // PUT: Mark notification as read
        updateNotification: `${baseUrl}/${NEXT_PUBLIC_API_CLIENT}/notifications/:notificationId/read`,
    },
    Location: {
        // GET: Get all provinces/cities from open-api.vn
        getProvinces: 'https://provinces.open-api.vn/api/v2/',
        // GET: Search provinces/cities by keyword (sử dụng "?q=" để tìm kiếm)
        searchProvinces: 'https://provinces.open-api.vn/api/v2/?q=',
    }
}
