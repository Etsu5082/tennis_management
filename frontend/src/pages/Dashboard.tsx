import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Practice, Participation } from '../types';
import { practiceAPI, participationAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [upcomingPractices, setUpcomingPractices] = useState<Practice[]>([]);
  const [myParticipations, setMyParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const practicesRes = await practiceAPI.getAll({
        from_date: today,
        status: 'open',
      });
      setUpcomingPractices(practicesRes.data.slice(0, 5));

      const participationsRes = await participationAPI.getMy();
      setMyParticipations(participationsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-lg text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ようこそ、{user?.name}さん
              </h1>
              <p className="mt-3 text-lg text-gray-600 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                {isAdmin ? '管理者' : 'メンバー'}としてログインしています
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎾</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Practices Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">募集中の練習</h2>
              </div>
              <Link
                to="/practices"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                すべて見る
                <span>→</span>
              </Link>
            </div>
            {upcomingPractices.length > 0 ? (
              <div className="space-y-4">
                {upcomingPractices.map((practice) => (
                  <Link
                    key={practice.id}
                    to={`/practices/${practice.id}`}
                    className="block p-5 border-2 border-gray-100 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">
                          {new Date(practice.date).toLocaleDateString('ja-JP', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </div>
                        <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                          <span>⏰</span>
                          {practice.start_time}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <span>📍</span>
                          {practice.location}
                        </div>
                      </div>
                      <span className="px-3 py-1.5 text-sm font-bold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg">
                        {practice.courts}面
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎾</span>
                <p className="text-gray-500 text-lg">現在募集中の練習はありません</p>
              </div>
            )}
          </div>

          {/* My Participations Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">自分の参加予定</h2>
              </div>
              <Link
                to="/my-participations"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                すべて見る
                <span>→</span>
              </Link>
            </div>
            {myParticipations.length > 0 ? (
              <div className="space-y-4">
                {myParticipations.map((participation) => (
                  <div
                    key={participation.id}
                    className="p-5 border-2 border-gray-100 rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {participation.date &&
                            new Date(participation.date).toLocaleDateString(
                              'ja-JP',
                              {
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short',
                              }
                            )}
                        </div>
                        <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                          <span>⏰</span>
                          {participation.start_time}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <span>📍</span>
                          {participation.location}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 text-sm font-bold rounded-lg ${
                          participation.status === 'attending'
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                            : participation.status === 'late'
                            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700'
                            : participation.status === 'waitlist'
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {participation.status === 'attending'
                          ? '✓ 参加'
                          : participation.status === 'late'
                          ? '⏱ 遅刻'
                          : participation.status === 'waitlist'
                          ? '⏳ キャンセル待ち'
                          : '✗ 不参加'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📋</span>
                <p className="text-gray-500 text-lg">参加予定の練習はありません</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Menu */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">管理者メニュー</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/practices"
                className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-emerald-400"
              >
                <div className="text-center">
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">📝</span>
                  <span className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    練習日程管理
                  </span>
                </div>
              </Link>
              <Link
                to="/admin/users"
                className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-blue-400"
              >
                <div className="text-center">
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">👥</span>
                  <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    メンバー管理
                  </span>
                </div>
              </Link>
              <Link
                to="/admin/ball-bags"
                className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-purple-400"
              >
                <div className="text-center">
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">🎾</span>
                  <span className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    ボルバ管理
                  </span>
                </div>
              </Link>
              <Link
                to="/admin/settings"
                className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-orange-400"
              >
                <div className="text-center">
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">⚙️</span>
                  <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    設定
                  </span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
