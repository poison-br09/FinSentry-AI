import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000',  // Same port your FastAPI is running on
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
