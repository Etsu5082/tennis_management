import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ballBagAPI, practiceAPI, userAPI } from '../services/api';

interface BallBag {
  id: number;
  name: string;
  current_holder_id: number | null;
  current_holder_name: string | null;
  created_at: string;
}

interface BallBagStats {
  user_id: number;
  user_name: string;
  takeaway_count: number;
}

const AdminBallBags: React.FC = () => {
  const { isAdmin } = useAuth();
  const [ballBags, setBallBags] = useState<BallBag[]>([]);
  const [stats, setStats] = useState<BallBagStats[]>([]);
  const [practices, setPractices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [newBallBagName, setNewBallBagName] = useState('');
  const [selectedPractice, setSelectedPractice] = useState('');
  const [selectedBallBag, setSelectedBallBag] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTakeawayForm, setShowTakeawayForm] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ballBagsRes, statsRes, practicesRes, usersRes] = await Promise.all([
        ballBagAPI.getAll(),
        ballBagAPI.getStats(new Date().getFullYear()),
        practiceAPI.getAll(),
        userAPI.getAll(),
      ]);
      setBallBags(ballBagsRes.data);
      setStats(statsRes.data);
      setPractices(practicesRes.data.filter((p: any) => new Date(p.date) >= new Date()));
      setUsers(usersRes.data.filter((u: any) => u.is_active));
    } catch (err: any) {
      setError(err.response?.data?.error || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBallBag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBallBagName.trim()) return;

    try {
      await ballBagAPI.create({ name: newBallBagName });
      setSuccessMessage('ボルバを追加しました');
      setNewBallBagName('');
      setShowAddForm(false);
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'ボルバの追加に失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRecordTakeaway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPractice || !selectedBallBag || !selectedUser) {
      setError('すべての項目を選択してください');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await ballBagAPI.recordTakeaway({
        practice_id: parseInt(selectedPractice),
        ball_bag_id: parseInt(selectedBallBag),
        user_id: parseInt(selectedUser),
      });
      setSuccessMessage('持ち帰り記録を保存しました');
      setSelectedPractice('');
      setSelectedBallBag('');
      setSelectedUser('');
      setShowTakeawayForm(false);
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || '持ち帰り記録の保存に失敗しました');
      setTimeout(() => setError(''), 3000);
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            ボルバ管理
          </h1>
          <p className="text-gray-600">ボールバッグの登録と持ち帰り記録の管理</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>✓</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowTakeawayForm(false);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            + 新しいボルバを追加
          </button>
          <button
            onClick={() => {
              setShowTakeawayForm(!showTakeawayForm);
              setShowAddForm(false);
            }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            📝 持ち帰り記録
          </button>
        </div>

        {/* Add Ball Bag Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">新しいボルバを追加</h3>
            <form onSubmit={handleAddBallBag} className="flex gap-4">
              <input
                type="text"
                value={newBallBagName}
                onChange={(e) => setNewBallBagName(e.target.value)}
                placeholder="ボルバ名（例: ボルバA）"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
              >
                追加
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </form>
          </div>
        )}

        {/* Record Takeaway Form */}
        {showTakeawayForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">持ち帰り記録</h3>
            <form onSubmit={handleRecordTakeaway} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">練習日</label>
                <select
                  value={selectedPractice}
                  onChange={(e) => setSelectedPractice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">選択してください</option>
                  {practices.map((practice) => (
                    <option key={practice.id} value={practice.id}>
                      {new Date(practice.date).toLocaleDateString('ja-JP')} - {practice.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ボルバ</label>
                <select
                  value={selectedBallBag}
                  onChange={(e) => setSelectedBallBag(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">選択してください</option>
                  {ballBags.map((bag) => (
                    <option key={bag.id} value={bag.id}>
                      {bag.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">持ち帰るメンバー</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">選択してください</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  記録する
                </button>
                <button
                  type="button"
                  onClick={() => setShowTakeawayForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ball Bags List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🎾</span>
              ボルバ一覧 ({ballBags.length})
            </h2>
            <div className="space-y-4">
              {ballBags.map((bag) => (
                <div
                  key={bag.id}
                  className="p-5 border-2 border-gray-100 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{bag.name}</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        現在の所持者:{' '}
                        <span className="font-bold text-purple-600">
                          {bag.current_holder_name || '未設定'}
                        </span>
                      </p>
                    </div>
                    <span className="px-3 py-1.5 text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg">
                      ID: {bag.id}
                    </span>
                  </div>
                </div>
              ))}
              {ballBags.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🎾</span>
                  <p className="text-gray-500 text-lg">ボルバが登録されていません</p>
                </div>
              )}
            </div>
          </div>

          {/* Annual Statistics */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📊</span>
              年間持ち帰り回数 ({new Date().getFullYear()}年)
            </h2>
            <div className="space-y-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.user_id}
                  className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-purple-600">
                      {index + 1}
                    </span>
                    <span className="font-bold text-gray-900">{stat.user_name}</span>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-bold rounded-lg">
                    {stat.takeaway_count}回
                  </span>
                </div>
              ))}
              {stats.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📊</span>
                  <p className="text-gray-500 text-lg">記録がありません</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBallBags;
