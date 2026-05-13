import axios from "axios";

// baseURL: "https://manchester-steel-web-be.vercel.app/api",
// baseURL: "http://localhost:5000/api",


const api = axios.create({
 baseURL: "http://localhost:5000/api",
  withCredentials: true, 
});

export default api;