import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Practice } from '../types';
import { practiceAPI } from '../services/api';

const Practices: React.FC = () => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchPractices();
  }, [filter]);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      let params: any = {};
      if (filter === 'upcoming') {
        params.from_date = today;
      } else if (filter === 'past') {
        params.to_date = today;
      }

      const response = await practiceAPI.getAll(params);
      setPractices(response.data);
    } catch (error) {
      console.error('Failed to fetch practices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      open: { bg: 'bg-green-100', text: 'text-green-700', label: '募集中' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: '締切済' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: '終了' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: '中止' },
    };
    const badge = badges[status] || badges.open;
    return (
      <span className={`px-3 py-1 text-sm font-bold rounded-lg ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            練習日程一覧
          </h1>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-white rounded-xl p-2 shadow-md">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'upcoming'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              今後の予定
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'past'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              過去の履歴
            </button>
          </div>
        </div>

        {/* Practices List */}
        {practices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {practices.map((practice) => (
              <Link
                key={practice.id}
                to={`/practices/${practice.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-emerald-400"
              >
                <div className="p-6">
                  {/* Date Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {new Date(practice.date).toLocaleDateString('ja-JP', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(practice.date).getFullYear()}年
                      </div>
                    </div>
                    {getStatusBadge(practice.status)}
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">⏰</span>
                      <span className="font-medium">{practice.start_time}</span>
                      {practice.end_time && (
                        <>
                          <span>〜</span>
                          <span className="font-medium">{practice.end_time}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">📍</span>
                      <span className="font-medium">{practice.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">🎾</span>
                      <span className="font-medium">
                        {practice.courts}面（定員: {practice.courts * practice.capacity_per_court}名）
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">💰</span>
                      <span className="font-medium">
                        {practice.court_fee_per_court.toLocaleString()}円/面
                      </span>
                    </div>

                    {/* Deadline */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        締切: {new Date(practice.deadline_datetime).toLocaleString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {practice.notes && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2">{practice.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 border-t border-gray-100">
                  <div className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 flex items-center justify-between">
                    <span>詳細を見る</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">🎾</span>
            <p className="text-xl text-gray-600">
              {filter === 'upcoming' && '今後の練習日程はありません'}
              {filter === 'past' && '過去の練習履歴はありません'}
              {filter === 'all' && '練習日程が登録されていません'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practices;
