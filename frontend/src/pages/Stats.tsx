import React, { useEffect, useState } from 'react';
import { CourtFeeStats } from '../types';
import { courtFeeAPI, ballBagAPI, participationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface BallBagStats {
  user_id: number;
  user_name: string;
  takeaway_count: number;
}

const Stats: React.FC = () => {
  const { user } = useAuth();
  const [courtFeeStats, setCourtFeeStats] = useState<CourtFeeStats[]>([]);
  const [ballBagStats, setBallBagStats] = useState<BallBagStats[]>([]);
  const [myCourtFee, setMyCourtFee] = useState<CourtFeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStats();
  }, [selectedYear]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [courtFeeRes, ballBagRes] = await Promise.all([
        courtFeeAPI.getAllStats(selectedYear),
        ballBagAPI.getStats(selectedYear),
      ]);

      setCourtFeeStats(courtFeeRes.data);
      setBallBagStats(ballBagRes.data);

      // Find current user's stats
      const myStats = courtFeeRes.data.find((stat: CourtFeeStats) => stat.id === user?.id);
      setMyCourtFee(myStats || null);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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

  const totalAnnualFee = courtFeeStats.reduce((sum, stat) => sum + (stat.annual_fee || 0), 0);
  const averageFeePerPerson = totalAnnualFee / (courtFeeStats.length || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              統計情報
            </h1>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
          </div>

          {/* My Stats Summary */}
          {myCourtFee && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-6 text-white mb-6">
              <h2 className="text-xl font-bold mb-4">あなたの統計</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">参加回数</p>
                  <p className="text-3xl font-bold">{myCourtFee.practice_count}回</p>
                </div>
                <div>
                  <p className="text-emerald-100 text-sm mb-1">支払総額</p>
                  <p className="text-3xl font-bold">¥{myCourtFee.total_paid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-emerald-100 text-sm mb-1">年会費相当</p>
                  <p className="text-3xl font-bold">¥{(myCourtFee.annual_fee || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">総参加者数</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{courtFeeStats.length}人</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">総支払額</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">¥{totalAnnualFee.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">平均支払額</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600">¥{Math.round(averageFeePerPerson).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Court Fee Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>💰</span>
              コート代統計
            </h2>

            {courtFeeStats.length > 0 ? (
              <div className="space-y-3">
                {courtFeeStats
                  .sort((a, b) => (b.annual_fee || 0) - (a.annual_fee || 0))
                  .map((stat, index) => (
                    <div
                      key={stat.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        stat.id === user?.id
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-gray-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{stat.name}</span>
                            {stat.id === user?.id && (
                              <span className="ml-2 text-xs font-semibold text-emerald-600">(あなた)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">参加回数</p>
                          <p className="font-bold text-gray-900">{stat.practice_count}回</p>
                        </div>
                        <div>
                          <p className="text-gray-600">支払総額</p>
                          <p className="font-bold text-green-600">¥{stat.total_paid.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">年会費相当</p>
                          <p className="font-bold text-blue-600">¥{(stat.annual_fee || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {totalAnnualFee > 0 && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${((stat.annual_fee || 0) / totalAnnualFee) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                データがありません
              </div>
            )}
          </div>

          {/* Ball Bag Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🎾</span>
              ボルバ持ち帰り統計
            </h2>

            {ballBagStats.length > 0 ? (
              <div className="space-y-3">
                {ballBagStats
                  .sort((a, b) => b.takeaway_count - a.takeaway_count)
                  .map((stat, index) => (
                    <div
                      key={stat.user_id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        stat.user_id === user?.id
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-gray-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{stat.user_name}</span>
                            {stat.user_id === user?.id && (
                              <span className="ml-2 text-xs font-semibold text-emerald-600">(あなた)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-600">{stat.takeaway_count}回</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {ballBagStats[0] && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${(stat.takeaway_count / ballBagStats[0].takeaway_count) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                データがありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
