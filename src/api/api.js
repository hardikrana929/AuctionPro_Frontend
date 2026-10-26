import axios from "axios";

const SITE_TOKEN_KEY = "auctionpro_site_token";
export const SITE_LOCKED_EVENT = "auctionpro:site-locked";

const tokenExpiresAt = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return Number(payload.exp) * 1000;
    } catch {
        return 0;
    }
};

// Kept in sessionStorage so a page refresh doesn't force a new OTP; cleared when the tab closes.
export const setSiteVerificationToken = (token) => {
    try {
        if (token) sessionStorage.setItem(SITE_TOKEN_KEY, token);
        else sessionStorage.removeItem(SITE_TOKEN_KEY);
    } catch { /* storage unavailable */ }
};

export const getSiteVerificationToken = () => {
    try {
        const token = sessionStorage.getItem(SITE_TOKEN_KEY);
        if (!token) return null;
        if (tokenExpiresAt(token) <= Date.now() + 5000) {
            sessionStorage.removeItem(SITE_TOKEN_KEY);
            return null;
        }
        return token;
    } catch {
        return null;
    }
};

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
    const siteToken = getSiteVerificationToken();
    if (siteToken) {
        config.headers["X-Site-Verification"] = siteToken;
    }

    return config;
});

// If the server says the site verification is missing/expired, lock the app and show the OTP gate again.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || "";
        if (error.response?.status === 403 && /Website verification|Verify the website/i.test(error.response.data?.message || "") && !url.includes("/site-otp/")) {
            setSiteVerificationToken(null);
            window.dispatchEvent(new Event(SITE_LOCKED_EVENT));
        }
        return Promise.reject(error);
    },
);

export default api;