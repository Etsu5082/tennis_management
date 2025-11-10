import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="bg-white shadow-lg border-b-2 border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-2 gap-3 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-2xl">🎾</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  テニスサークル管理
                </span>
              </Link>
              <div className="hidden md:ml-8 md:flex md:space-x-2">
                <Link
                  to="/"
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/')
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <span className="mr-2">🏠</span>
                  ダッシュボード
                </Link>
                <Link
                  to="/practices"
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/practices')
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <span className="mr-2">📅</span>
                  練習日程
                </Link>
                <Link
                  to="/my-participations"
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/my-participations')
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <span className="mr-2">✅</span>
                  参加履歴
                </Link>
                <Link
                  to="/stats"
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/stats')
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <span className="mr-2">📊</span>
                  統計
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive('/admin')
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                        : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <span className="mr-2">⚙️</span>
                    管理
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
