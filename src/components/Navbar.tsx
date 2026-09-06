import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { THEMES, useThemeStore } from '../store/useThemeStore';


export function Navbar() {
  const { theme, setTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Đảm bảo attribute data-theme luôn đồng bộ khi component mount lần đầu
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Xử lý khi Submit thanh tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="navbar bg-base-100 border-b border-base-200 px-2 sm:px-6 sticky top-0 z-50 shadow-xs">
      {/* ==================== 1. NAVBAR START (Logo & Mobile Menu) ==================== */}
      <div className="navbar-start gap-1">
        {/* Mobile Hamburger Menu */}
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-md dropdown-content bg-base-100 rounded-box z-50 mt-3 w-56 p-2 shadow-lg border border-base-200"
          >
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'active font-bold' : '')}>
                rang chủ
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className={({ isActive }) => (isActive ? 'active font-bold' : '')}>
                Tìm kiếm nâng cao
              </NavLink>
            </li>
            <li>
              <NavLink to="/history" className={({ isActive }) => (isActive ? 'active font-bold' : '')}>
                Lịch sử đọc
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Logo Thương Hiệu */}
        <Link to="/" className="btn btn-ghost text-xl font-extrabold tracking-wide text-primary px-2">
          MoeTruyen
        </Link>
      </div>

      {/* ==================== 2. NAVBAR CENTER (Menu hiển thị trên PC) ==================== */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1 ">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`
              }
            >
              Trang chủ
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`
              }
            >
              Tìm kiếm
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`
              }
            >
              Lịch sử
            </NavLink>
          </li>
        </ul>
      </div>

      {/* ==================== 3. NAVBAR END (Search Box + Theme Selector) ==================== */}
      <div className="navbar-end gap-2">
        {/* Form tìm kiếm nhanh */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm truyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered w-32 md:w-48 pr-8 focus:w-60 transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Nút Tìm kiếm icon cho mobile */}
        <Link to="/search" className="btn btn-ghost btn-circle btn-sm sm:hidden" aria-label="Search page">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>

        {/* 🎨 DROPDOWN BỘ CHỌN THEME (ZUSTAND STORE) */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm" title="Đổi giao diện">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-sm bg-base-100 rounded-box z-50 mt-3 w-44 p-2 shadow-xl border border-base-200 max-h-80 overflow-y-auto"
          >
            <li className="menu-title text-xs font-semibold opacity-60">Chọn Giao Diện</li>
            {THEMES.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`flex justify-between items-center ${theme === item.id ? 'active font-bold' : ''}`}
                >
                  <span>{item.name}</span>
                  {theme === item.id && <span>✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}