import axios from 'axios';

// export const api= axios.create({
//     baseURL: 'https://api.example.com', // Replace with your API base URL
//     timeout: 10000, // Set a timeout for requests (in milliseconds)
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.API_KEY}` // Replace with your API key or token  
//     }
// })


// Create a configured Axios instance with a base URL
const api = axios.create({
  baseURL: 'https://api.example.com/v1',
  timeout: 5000, // Optional: set a timeout of 5 seconds
  headers: {
    'Content-Type': 'application/json',
    // You can add any default headers here
     'Authorization': `Bearer ${process.env.API_KEY}}` // Example of adding an auth token
  }
});

// Optional: Add request interceptor
api.interceptors.request.use(
  (config) => {
    // You can modify the request config before it's sent
    // For example, add a token dynamically
    // config.headers.Authorization = `Bearer ${getToken()}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor
api.interceptors.response.use(
  (response) => {
    // You can transform response data here
    return response;
  },
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);

// Example usage
export const fetchData = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default api;