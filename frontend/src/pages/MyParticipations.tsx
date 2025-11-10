import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Participation } from '../types';
import { participationAPI } from '../services/api';

const MyParticipations: React.FC = () => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const response = await participationAPI.getMy();
      setParticipations(response.data);
    } catch (error) {
      console.error('Failed to fetch participations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      attending: { bg: 'bg-green-100', text: 'text-green-700', label: '参加', icon: '✓' },
      late: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '遅刻', icon: '⏱' },
      absent: { bg: 'bg-gray-100', text: 'text-gray-700', label: '不参加', icon: '✗' },
      waitlist: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'キャンセル待ち', icon: '⏳' },
    };
    const badge = badges[status] || badges.attending;
    return (
      <span className={`px-3 py-1.5 text-sm font-bold rounded-lg ${badge.bg} ${badge.text} inline-flex items-center gap-1`}>
        <span>{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const getPracticeStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      open: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '募集中' },
      closed: { bg: 'bg-gray-50', text: 'text-gray-700', label: '締切済' },
      completed: { bg: 'bg-blue-50', text: 'text-blue-700', label: '終了' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: '中止' },
    };
    const badge = badges[status] || badges.open;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredParticipations = participations.filter((participation) => {
    if (filter === 'all') return true;
    const practiceDate = new Date(participation.date || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      return practiceDate >= today;
    } else {
      return practiceDate < today;
    }
  });

  const upcomingCount = participations.filter(p => {
    const practiceDate = new Date(p.date || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return practiceDate >= today;
  }).length;

  const pastCount = participations.filter(p => {
    const practiceDate = new Date(p.date || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return practiceDate < today;
  }).length;

  const attendingCount = participations.filter(p => p.status === 'attending' || p.status === 'late').length;

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            参加履歴
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">総申し込み</p>
                  <p className="text-3xl font-bold text-gray-900">{participations.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">参加予定</p>
                  <p className="text-3xl font-bold text-green-600">{upcomingCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">参加実績</p>
                  <p className="text-3xl font-bold text-blue-600">{attendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-white rounded-xl p-2 shadow-md">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              すべて ({participations.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'upcoming'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              今後の予定 ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'past'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              過去の履歴 ({pastCount})
            </button>
          </div>
        </div>

        {/* Participations List */}
        {filteredParticipations.length > 0 ? (
          <div className="space-y-4">
            {filteredParticipations.map((participation) => (
              <Link
                key={participation.id}
                to={`/practices/${participation.practice_id}`}
                className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-emerald-400"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Date and Time */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {participation.date &&
                            new Date(participation.date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                        </h3>
                        {participation.practice_status && getPracticeStatusBadge(participation.practice_status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⏰</span>
                          <span className="font-medium">{participation.start_time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <span className="font-medium">{participation.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      {getStatusBadge(participation.status)}
                      <span className="text-gray-400 hidden md:block">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <p className="text-xl text-gray-600">
              {filter === 'upcoming' && '今後の参加予定はありません'}
              {filter === 'past' && '過去の参加履歴はありません'}
              {filter === 'all' && '参加履歴がありません'}
            </p>
            <Link
              to="/practices"
              className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              練習日程を見る
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyParticipations;
