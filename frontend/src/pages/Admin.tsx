import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Admin: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">🚫</span>
            <p className="text-xl text-gray-600">管理者権限が必要です</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            管理者ダッシュボード
          </h1>
          <p className="text-gray-600">サークルの運営と管理</p>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Practice Management */}
          <Link
            to="/admin/practices"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-emerald-400"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                練習日程管理
              </h3>
              <p className="text-gray-600">
                練習日程の作成・編集・削除を行います
              </p>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-4 border-t border-gray-100">
              <span className="text-emerald-600 font-semibold group-hover:translate-x-2 inline-block transition-transform">
                管理画面へ →
              </span>
            </div>
          </Link>

          {/* User Management */}
          <Link
            to="/admin/users"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-400"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                メンバー管理
              </h3>
              <p className="text-gray-600">
                メンバーの承認、役割の変更、アカウント管理
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 border-t border-gray-100">
              <span className="text-blue-600 font-semibold group-hover:translate-x-2 inline-block transition-transform">
                管理する →
              </span>
            </div>
          </Link>

          {/* Ball Bag Management */}
          <Link
            to="/admin/ball-bags"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-400"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🎾</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                ボルバ管理
              </h3>
              <p className="text-gray-600">
                ボルバの登録、持ち帰り記録、統計の確認
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-4 border-t border-gray-100">
              <span className="text-purple-600 font-semibold group-hover:translate-x-2 inline-block transition-transform">
                管理する →
              </span>
            </div>
          </Link>

          {/* Payment Management */}
          <Link
            to="/admin/payments"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-yellow-400"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                支払い管理
              </h3>
              <p className="text-gray-600">
                コート代の支払い管理と予約者情報の確認
              </p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-8 py-4 border-t border-gray-100">
              <span className="text-yellow-600 font-semibold group-hover:translate-x-2 inline-block transition-transform">
                管理する →
              </span>
            </div>
          </Link>

          {/* Settings */}
          <Link
            to="/admin/settings"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-400"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">⚙️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                システム設定
              </h3>
              <p className="text-gray-600">
                システム全体の設定、通知設定、その他
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-8 py-4 border-t border-gray-100">
              <span className="text-orange-600 font-semibold group-hover:translate-x-2 inline-block transition-transform">
                設定する →
              </span>
            </div>
          </Link>

          {/* Reports */}
          <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 opacity-60 cursor-not-allowed">
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                レポート
              </h3>
              <p className="text-gray-600">
                詳細な統計レポートとデータ分析（近日公開）
              </p>
            </div>
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
              <span className="text-gray-400 font-semibold">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/practices"
              className="px-4 py-2 bg-white border-2 border-emerald-200 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 hover:border-emerald-400 transition-all"
            >
              練習日程を管理
            </Link>
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-white border-2 border-blue-200 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all"
            >
              メンバーを承認
            </Link>
            <Link
              to="/stats"
              className="px-4 py-2 bg-white border-2 border-purple-200 text-purple-700 font-semibold rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all"
            >
              統計を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
