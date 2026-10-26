import axios from "axios";

let siteVerificationToken = null;

export const setSiteVerificationToken = (token) => { siteVerificationToken = token || null; };
export const getSiteVerificationToken = () => siteVerificationToken;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auctionpro_token") || sessionStorage.getItem("auctionpro_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (siteVerificationToken) {
        config.headers["X-Site-Verification"] = siteVerificationToken;
    }

    return config;
});

export default api;