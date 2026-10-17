import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSun,
  FiUsers,
  FiUser,
  FiFlag,
  FiX,
  FiPlusCircle,
  FiMessageSquare,
} from "react-icons/fi";

import { MdEmojiEvents } from "react-icons/md";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "../components/NotificationBell";

const navigation = [
  { label: "Overview", to: "/admin", icon: FiGrid },
  { label: "Auctions", to: "/admin/auctions", icon: MdEmojiEvents },
  {
    label: "Create auction",
    to: "/admin/auctions/new",
    icon: FiPlusCircle,
  },
  { label: "Users", to: "/admin/users", icon: FiUsers },
  { label: "Teams", to: "/admin/teams", icon: FiFlag },
  { label: "Players", to: "/admin/players", icon: FiUser },
  { label: "Feedback", to: "/admin/feedback", icon: FiMessageSquare },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    setMobileOpen(false);
    logout();
    navigate("/admin/login", { replace: true });
  }

  const sidebar = (isMobile = false) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Brand */}
        <div
          className={`flex h-[74px] shrink-0 items-center gap-3 border-b border-slate-200 dark:border-slate-800 ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <div
            className={`flex min-w-0 items-center ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20">
              A
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate font-bold tracking-tight text-slate-900 dark:text-white">
                  AuctionPro
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Admin console
                </p>
              </div>
            )}
          </div>

          {isMobile && (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FiX size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          {!isCollapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Workspace
            </p>
          )}

          <div className="space-y-1.5">
            {navigation.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={() => {
                  if (isMobile) setMobileOpen(false);
                }}
                title={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  [
                    "group flex w-full min-w-0 items-center rounded-xl py-3 text-sm transition-colors duration-150",
                    isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                    isActive
                      ? "bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/20"
                      : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={19} className="shrink-0" aria-hidden="true" />

                {!isCollapsed && (
                  <span className="min-w-0 truncate">{label}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Account actions */}
        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
          <div
            className={`mb-3 flex min-w-0 items-center rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800 ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              {(user?.username || "A").slice(0, 1).toUpperCase()}
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.username || "Administrator"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Administrator
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Sign out" : undefined}
            className={`flex w-full items-center rounded-xl py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 ${
              isCollapsed ? "justify-center px-2" : "gap-3 px-3"
            }`}
          >
            <FiLogOut size={18} className="shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-white transition-[width] duration-200 lg:block dark:border-slate-800 dark:bg-slate-900 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebar(false)}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[92px] z-40 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {collapsed ? (
            <FiChevronRight size={16} />
          ) : (
            <FiChevronLeft size={16} />
          )}
        </button>
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        aria-label="Mobile navigation"
        className={`fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 lg:hidden dark:border-slate-800 dark:bg-slate-900 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar(true)}
      </aside>

      {/* Main workspace */}
      <div
        className={`min-h-screen min-w-0 transition-[padding] duration-200 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-16 min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur-xl sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="shrink-0 rounded-xl p-2 transition hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            >
              <FiMenu size={21} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Admin workspace</p>
              <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
                Manage your cricket auctions
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span className="hidden items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 md:inline-flex dark:bg-emerald-950 dark:text-emerald-300">
              <FiActivity className="mr-1.5" />
              Admin access
            </span>

            <NotificationBell />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <FiSun size={19} /> : <FiMoon size={19} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full min-w-0 max-w-[1600px] p-3 sm:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
