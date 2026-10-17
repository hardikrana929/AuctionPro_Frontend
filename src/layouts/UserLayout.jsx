import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiMoon,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiMessageSquare,
  FiActivity,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "../components/NotificationBell";

const links = [
  { label: "Dashboard", to: "/dashboard", icon: FiGrid },
  { label: "Manage Teams", to: "/manage/teams", icon: FiUsers },
  { label: "Manage Players", to: "/manage/players", icon: FiUser },
  { label: "Live Bidding", to: "/live-auction", icon: FiActivity },
  { label: "Feedback", to: "/feedback", icon: FiMessageSquare },
  { label: "Profile", to: "/profile", icon: FiUser },
];

export default function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    setMobileOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  function renderNavigation(isMobile = false) {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <div className="flex h-full min-h-0 flex-col">
        <div
          className={`flex h-[74px] shrink-0 items-center border-b border-slate-200 dark:border-slate-800 ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <NavLink
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">
              A
            </span>

            {!isCollapsed && (
              <span className="min-w-0">
                <span className="block truncate font-bold text-slate-900 dark:text-white">
                  AuctionPro
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  User workspace
                </span>
              </span>
            )}
          </NavLink>

          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FiX size={20} />
            </button>
          )}
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {!isCollapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Workspace
            </p>
          )}

          {links.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              title={isCollapsed ? label : undefined}
              onClick={() => {
                if (isMobile) setMobileOpen(false);
              }}
              className={({ isActive }) =>
                [
                  "flex min-w-0 items-center rounded-xl py-3 text-sm transition-colors",
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                  isActive
                    ? "bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/20"
                    : "font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                ].join(" ")
              }
            >
              <Icon size={19} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
          <div
            className={`mb-3 flex min-w-0 items-center rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800 ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              {(user?.username || "U").slice(0, 1).toUpperCase()}
            </span>

            {!isCollapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.username || "User"}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Auction user
                </span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Sign out" : undefined}
            className={`flex w-full items-center rounded-xl py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 ${
              isCollapsed ? "justify-center px-2" : "gap-3 px-3"
            }`}
          >
            <FiLogOut size={18} />
            {!isCollapsed && "Sign out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-white transition-[width] duration-200 lg:block dark:border-slate-800 dark:bg-slate-900 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderNavigation()}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[92px] flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:hidden dark:border-slate-800 dark:bg-slate-900 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavigation(true)}
      </aside>

      <div
        className={`min-h-screen min-w-0 transition-[padding] duration-200 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur-xl sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl p-2 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            >
              <FiMenu size={21} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">User workspace</p>
              <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
                Manage your assigned auction
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />
            <span className="hidden max-w-36 truncate text-sm font-medium sm:block">
              {user?.username}
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <FiSun size={19} /> : <FiMoon size={19} />}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-[1600px] p-3 sm:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
