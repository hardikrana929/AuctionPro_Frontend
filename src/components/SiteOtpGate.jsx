import { useEffect, useState } from "react";
import { FiMail, FiShield, FiRefreshCw, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import api, { setSiteVerificationToken } from "../api/api";

export default function SiteOtpGate({ onVerified }) {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("hstudy.project@gmail.com");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    setBusy(true); setError("");
    try {
      await api.post("/site-otp/send", {});
      setEmailSent(true); setOtp("");
      toast.success("Verification code sent to the configured email.");
    } catch (e) {
<<<<<<< HEAD
      const message = e.response?.data?.message || "Could not send OTP. Please try again later.";
      setError(message); toast.error(message);
=======
      if (e.response?.status === 429 && e.response?.data?.retryAfterSeconds) {
        // A code was already sent recently - not a failure, just wait before resending.
        setCooldown(e.response.data.retryAfterSeconds);
        setInfo("A code was sent recently. Check your inbox (and spam folder).");
      } else {
        const message = describeError(e, "Could not send OTP. Please try again later.");
        setError(message); toast.error(message);
      }
>>>>>>> parent of 9b0c7a2 (change)
    } finally { setBusy(false); }
  };

  useEffect(() => { sendOtp(); }, []);

  const verify = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const { data } = await api.post("/site-otp/verify", { otp: otp.trim() });
      if (!data?.token) throw new Error("The server did not return a verification token.");
      setSiteVerificationToken(data.token);
      onVerified();
    } catch (e) {
      const message = e.response?.data?.message || e.message || "OTP verification failed.";
      setError(message); toast.error(message);
    } finally { setBusy(false); }
  };

  return (
    <main className="site-otp-page">
      <section className="site-otp-card">
        <div className="site-otp-logo"><FiShield /></div>
        <p className="site-otp-eyebrow">AUCTIONPRO SECURITY</p>
        <h1>Verify your access</h1>
        <p className="site-otp-description">Verify your email before entering AuctionPro. The rest of the website stays locked until verification succeeds.</p>
        <div className="site-otp-email"><FiMail /><span>{email}</span></div>
        <form onSubmit={verify}>
          <label htmlFor="site-otp">6-digit verification code</label>
          <input id="site-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
          {error && <p className="site-otp-error" role="alert">{error}</p>}
          <button className="site-otp-submit" type="submit" disabled={busy || otp.length !== 6}>{busy ? "Please wait…" : <><FiLock /> Verify and continue</>}</button>
        </form>
        <button className="site-otp-resend" type="button" onClick={sendOtp} disabled={busy}><FiRefreshCw /> Resend code</button>
        <p className="site-otp-footnote">Never share your verification code with anyone.</p>
      </section>
    </main>
  );
}
