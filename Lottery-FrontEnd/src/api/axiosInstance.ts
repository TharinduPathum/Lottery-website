import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ඔයාගේ Backend එක රන් වෙන URL එක
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;