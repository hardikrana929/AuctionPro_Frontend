import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiMail,
  FiShield,
  FiRefreshCw,
  FiLock,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api, { setSiteVerificationToken } from "../api/api";
import { useTheme } from "../context/ThemeContext";

const FALLBACK_EMAIL = "hstudy.project@gmail.com";
const RESEND_SECONDS = 60;

const describeError = (e, fallback) => {
  if (e.response?.data?.message) return e.response.data.message;
  if (e.code === "ECONNABORTED")
    return "The server is taking too long to respond (it may be waking up). Please try again.";
  if (!e.response)
    return "Cannot reach the server. Check your internet connection and the API URL, then try again.";
  return fallback;
};

export default function SiteOtpGate({ onVerified }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState(FALLBACK_EMAIL);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const startedRef = useRef(false); // React StrictMode runs effects twice in dev - send only once

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      // Longer timeout: free hosts can take a while to wake up.
      const { data } = await api.post("/site-otp/send", {}, { timeout: 45000 });
      if (data?.email) setEmail(data.email);
      setOtp("");
      setCooldown(data?.resendAfterSeconds || RESEND_SECONDS);
      setInfo("Verification code sent. It is valid for 5 minutes.");
      toast.success("Verification code sent to the configured email.");
    } catch (e) {
      if (e.response?.status === 429 && e.response?.data?.retryAfterSeconds) {
        // A code was already sent recently - not a failure, just wait before resending.
        setCooldown(e.response.data.retryAfterSeconds);
        setInfo(
          "A code was sent recently. Check your inbox (and spam folder).",
        );
      } else {
        const reason = e.response?.data?.reason;
        const message =
          describeError(e, "Could not send OTP. Please try again later.") +
          (reason ? ` (reason: ${reason})` : "");
        setError(message);
        toast.error(message);
      }
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    sendOtp();
  }, [sendOtp]);

  const verify = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const { data } = await api.post("/site-otp/verify", { otp: otp.trim() });
      if (!data?.token)
        throw new Error("The server did not return a verification token.");
      setSiteVerificationToken(data.token);
      toast.success("Verified. Welcome to AuctionPro!");
      onVerified();
    } catch (e) {
      const message = describeError(e, "OTP verification failed.");
      setError(message);
      toast.error(message);
      if (/expired|too many/i.test(message)) setOtp("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="site-otp-page">
      <button
        type="button"
        className="site-otp-theme"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light mode" : "Dark mode"}
      >
        {isDark ? <FiSun /> : <FiMoon />}
      </button>
      <section className="site-otp-card">
        <div className="site-otp-logo">
          <FiShield />
        </div>
        <p className="site-otp-eyebrow">AUCTIONPRO SECURITY</p>
        <h1>Verify your access</h1>
        <p className="site-otp-description">
          Verify your email before entering AuctionPro. The rest of the website
          stays locked until verification succeeds.
        </p>
        {/* <div className="site-otp-email">
          <FiMail />
          <span>{email}</span>
        </div> */}
        <form onSubmit={verify}>
          <label htmlFor="site-otp">6-digit verification code</label>
          <input
            id="site-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
          />
          {info && !error && (
            <p className="site-otp-info" role="status">
              {info}
            </p>
          )}
          {error && (
            <p className="site-otp-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="site-otp-submit"
            type="submit"
            disabled={busy || otp.length !== 6}
          >
            {busy ? (
              "Please wait…"
            ) : (
              <>
                <FiLock /> Verify and continue
              </>
            )}
          </button>
        </form>
        <button
          className="site-otp-resend"
          type="button"
          onClick={sendOtp}
          disabled={busy || cooldown > 0}
        >
          <FiRefreshCw />{" "}
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <p className="site-otp-footnote">
          Never share your verification code with anyone.
        </p>
      </section>
    </main>
  );
}
