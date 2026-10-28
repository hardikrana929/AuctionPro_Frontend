import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api, { getSiteVerificationToken } from "../api/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
      setUnread(response.data.unreadCount || 0);
    } catch {
      // Notifications should not prevent the dashboard from rendering.
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 30000);
    const token = sessionStorage.getItem("auctionpro_token");
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:5000";
    const socket = token
      ? io(socketUrl, {
          auth: { token, siteVerificationToken: getSiteVerificationToken() },
          transports: ["websocket", "polling"],
        })
      : null;
    socket?.on("notification:new", () => load());
    return () => {
      window.clearInterval(interval);
      socket?.disconnect();
    };
  }, [load]);

  async function markRead(item) {
    try {
      await api.patch(`/notifications/${item._id}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === item._id
            ? { ...notification, readAt: new Date().toISOString() }
            : notification,
        ),
      );
      setUnread((count) => Math.max(0, count - (item.readAt ? 0 : 1)));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to mark notification as read.",
      );
    }
  }

  async function markAllRead() {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          readAt: item.readAt || new Date().toISOString(),
        })),
      );
      setUnread(0);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update notifications.",
      );
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications, ${unread} unread`}
        className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(23rem,90vw)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <div>
              <p className="font-bold">Notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unread} unread
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"
            >
              <CheckCheck size={15} /> Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? (
              notifications.map((item) => (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => markRead(item)}
                  className={`block w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70 ${!item.readAt ? "bg-blue-50/60 dark:bg-blue-950/20" : ""}`}
                >
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {item.message}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            ) : (
              <p className="p-6 text-center text-sm text-slate-500">
                You're all caught up.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
