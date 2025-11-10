import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { practiceAPI } from '../services/api';
import { Practice } from '../types';

interface ReservationAccount {
  user_name: string;
  user_number: string;
  student_id: string | null;
}

interface PracticeWithReservations extends Practice {
  reservation_accounts?: ReservationAccount[];
}

const PaymentManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [practices, setPractices] = useState<PracticeWithReservations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (isAdmin) {
      fetchPractices();
    }
  }, [isAdmin, filterYear]);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceAPI.getAll({
        from_date: `${filterYear}-01-01`,
        to_date: `${filterYear}-12-31`,
      });

      // 各練習の詳細を取得して予約者情報を含める
      const practicesWithReservations = await Promise.all(
        response.data.map(async (practice: Practice) => {
          try {
            const detailResponse = await practiceAPI.getById(practice.id);
            return detailResponse.data;
          } catch (err) {
            console.error(`Failed to fetch practice ${practice.id}:`, err);
            return practice;
          }
        })
      );

      setPractices(practicesWithReservations);
    } catch (err: any) {
      setError(err.response?.data?.error || '練習一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-lg text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            コート代支払い管理
          </h1>
          <p className="text-gray-600">予約者情報とコート代の管理</p>
        </div>

        {/* Year Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">表示年度</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Practices List */}
        <div className="space-y-6">
          {practices.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <span className="text-6xl mb-4 block">📅</span>
              <p className="text-gray-500 text-lg">{filterYear}年の練習記録がありません</p>
            </div>
          ) : (
            practices.map((practice) => (
              <div key={practice.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                {/* Practice Info */}
                <div className="mb-4 pb-4 border-b-2 border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {new Date(practice.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </h3>
                      <div className="space-y-1 text-gray-600">
                        <p>
                          <span className="font-semibold">時間:</span> {practice.start_time}
                          {practice.end_time && ` - ${practice.end_time}`}
                        </p>
                        <p>
                          <span className="font-semibold">場所:</span> {practice.location || '未設定'}
                        </p>
                        <p>
                          <span className="font-semibold">コート数:</span> {practice.courts}面
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-600">
                        ¥{(practice.courts * practice.court_fee_per_court).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        ({practice.courts}面 × ¥{practice.court_fee_per_court.toLocaleString()})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reservation Accounts */}
                {practice.reservation_accounts && practice.reservation_accounts.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span>💳</span>
                      予約者情報（コート支払い名義）
                    </h4>
                    <div className="space-y-2">
                      {practice.reservation_accounts.map((account, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm font-semibold text-gray-600">氏名</span>
                              <p className="text-lg font-bold text-gray-900">{account.user_name}</p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-600">利用者番号</span>
                              <p className="text-lg font-bold text-gray-900">{account.user_number}</p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-600">学籍番号</span>
                              <p className="text-lg font-bold text-gray-900">
                                {account.student_id || '未登録'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-gray-500">予約者情報が登録されていません</p>
                    <p className="text-sm text-gray-400 mt-1">
                      テキストファイルからのインポート時に自動登録されます
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
