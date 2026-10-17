import { useCallback, useEffect, useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import { EmptyState, LoadingState } from "../components/Feedback";

const cardClass = "rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
const categories = ["Bug report", "Suggestion", "Auction experience", "Other"];
const statuses = ["New", "In Review", "Resolved"];

export default function FeedbackPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "Suggestion", rating: 5, message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(isAdmin ? "/feedback" : "/feedback/mine");
      setItems(response.data.feedback || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load feedback.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/feedback", form);
      toast.success("Feedback submitted. Thank you!");
      setForm({ category: "Suggestion", rating: 5, message: "" });
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateItem(item, field, value) {
    const payload = {
      status: field === "status" ? value : item.status,
      adminResponse: field === "adminResponse" ? value : item.adminResponse || "",
    };
    try {
      const response = await api.patch(`/feedback/${item._id}`, payload);
      setItems((current) => current.map((entry) => entry._id === item._id ? response.data.feedback : entry));
      toast.success("Feedback updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update feedback.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Help us improve" title={isAdmin ? "Feedback management" : "Feedback"} description={isAdmin ? "Review user feedback, update its status, and send a response." : "Share a bug report, suggestion, or experience with the AuctionPro team."} />
      {!isAdmin && <form onSubmit={submit} className={`${cardClass} space-y-5 p-5 sm:p-7`}>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><div><p className="text-sm font-semibold">Rating</p><div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} star rating`} onClick={() => setForm({ ...form, rating })} className={`rounded-lg p-2 ${rating <= form.rating ? "text-amber-500" : "text-slate-300 dark:text-slate-600"}`}><Star size={22} fill={rating <= form.rating ? "currentColor" : "none"} /></button>)}</div></div></div>
        <label className="block text-sm font-semibold">Your feedback<textarea required minLength={5} maxLength={2000} rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us what worked well or what we can improve..." className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /></label>
        <button disabled={submitting} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"><Send size={16} /> {submitting ? "Submitting..." : "Submit feedback"}</button>
      </form>}
      <section className={`${cardClass} overflow-hidden`}><div className="flex items-center gap-3 border-b border-slate-200 p-5 dark:border-slate-800"><MessageSquare className="text-blue-600" /><div><h2 className="font-bold">{isAdmin ? "All submissions" : "Your submissions"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{items.length} feedback item(s)</p></div></div>
        {loading ? <LoadingState label="Loading feedback..." /> : !items.length ? <EmptyState title="No feedback yet" description={isAdmin ? "User feedback will appear here after it is submitted." : "Your submitted feedback and admin responses will appear here."} /> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{items.map((item) => <FeedbackItem key={item._id} item={item} isAdmin={isAdmin} onUpdate={updateItem} />)}</div>}
      </section>
    </div>
  );
}

function FeedbackItem({ item, isAdmin, onUpdate }) {
  const [response, setResponse] = useState(item.adminResponse || "");
  return <article className="space-y-4 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{item.category}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold dark:bg-slate-800">{item.status}</span></div><p className="mt-3 text-sm font-semibold">{item.userId?.username || "You"} · {new Date(item.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-1 text-amber-500">{Array.from({ length: item.rating || 0 }, (_, index) => <Star key={index} size={15} fill="currentColor" />)}</div></div><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{item.message}</p>
    {isAdmin ? <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]"><select value={item.status} onChange={(event) => onUpdate(item, "status", event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950">{statuses.map((status) => <option key={status}>{status}</option>)}</select><textarea rows={2} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Write a response for the user..." className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950" /><button type="button" onClick={() => onUpdate(item, "adminResponse", response)} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">Save response</button></div> : item.adminResponse && <div className="rounded-xl bg-blue-50 p-4 text-sm dark:bg-blue-950/50"><p className="font-bold text-blue-800 dark:text-blue-300">Admin response</p><p className="mt-1 whitespace-pre-wrap text-blue-900 dark:text-blue-100">{item.adminResponse}</p></div>}
  </article>;
}
