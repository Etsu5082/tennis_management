import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { User } from '../types';

const AdminUsers: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'member'>('member');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await userAPI.approve(userId);
      setSuccessMessage('ユーザーを承認しました');
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'ユーザーの承認に失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!window.confirm(`${userName}さんを削除してもよろしいですか？`)) {
      return;
    }

    try {
      await userAPI.delete(userId);
      setSuccessMessage('ユーザーを削除しました');
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'ユーザーの削除に失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setError('すべての項目を入力してください');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (newUserPassword.length < 6) {
      setError('パスワードは6文字以上にしてください');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await userAPI.create({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        is_active: true
      });
      setSuccessMessage('ユーザーを作成しました');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('member');
      setShowCreateForm(false);
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'ユーザーの作成に失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile) {
      setError('CSVファイルを選択してください');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const fileContent = await csvFile.text();
      const response = await userAPI.importCSV(fileContent);
      const data = response.data;

      setSuccessMessage(`${data.created.length}名のユーザーを作成しました。${data.errors.length > 0 ? `${data.errors.length}件のエラーがありました。` : ''}`);
      setCSVFile(null);
      setShowCSVImport(false);
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'CSVインポートに失敗しました');
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-lg text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.is_active);
  const pendingUsers = users.filter((u) => !u.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              メンバー管理
            </h1>
            <p className="text-gray-600">メンバーの承認とアカウント管理</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCSVImport(!showCSVImport)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              CSV一括登録
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all"
            >
              + 新規メンバー追加
            </button>
          </div>
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

        {/* Create User Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">新規メンバー追加</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">名前</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="山田太郎"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">パスワード</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="6文字以上"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">役割</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">👤 メンバー</option>
                    <option value="admin">👑 管理者</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CSV Import Form */}
        {showCSVImport && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">CSV一括登録</h3>
            <form onSubmit={handleCSVImport} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">CSVファイル</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  対応フォーマット：
                  <br />
                  1) Name,Kana,Year,user_number,password (user_number=登録番号、password=学籍番号)
                  <br />
                  2) 名前,カタカナ,性別,学年,学部,学科,学籍番号,...,登録番号
                  <br />
                  初期パスワードは学籍番号と同じです。初回ログイン時にパスワード変更が必要です。
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                  disabled={!csvFile}
                >
                  インポート
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCSVImport(false);
                    setCSVFile(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⏳</span>
              承認待ちメンバー ({pendingUsers.length})
            </h2>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl p-6 shadow-md border-2 border-yellow-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                      <p className="text-gray-600 mt-1">学籍番号: {user.student_id}</p>
                      {user.registration_number && (
                        <p className="text-gray-600 mt-1">登録番号: {user.registration_number}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all"
                      >
                        ✓ 承認
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-red-100 hover:text-red-700 transition-all"
                      >
                        ✗ 却下
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Members */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>👥</span>
            アクティブメンバー ({activeUsers.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    学籍番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    登録番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    役割
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.student_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.registration_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {user.role === 'admin' ? '👑 管理者' : '👤 メンバー'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-red-600 hover:text-red-900 font-bold transition-colors"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
