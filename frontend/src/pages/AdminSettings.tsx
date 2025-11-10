import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { settingsAPI } from '../services/api';

interface SettingsData {
  [key: string]: {
    value: string;
    description: string;
  };
}


const AdminSettings: React.FC = () => {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      setSettings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '設定の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSave = async (key: string) => {
    try {
      await settingsAPI.update(key, editValue);
      setSuccessMessage('設定を更新しました');
      setEditingKey(null);
      fetchSettings();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || '設定の更新に失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-lg text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  const settingsConfig = [
    {
      key: 'default_deadline_days',
      label: 'デフォルト締め切り日数',
      description: '練習日の何日前を締め切りとするか',
      unit: '日前',
    },
    {
      key: 'default_deadline_time',
      label: 'デフォルト締め切り時刻',
      description: '締め切り日の時刻',
      unit: '',
    },
    {
      key: 'default_capacity_per_court',
      label: 'デフォルト1面あたり定員',
      description: '1面あたりの参加者数',
      unit: '人',
    },
    {
      key: 'annual_fee',
      label: '年会費',
      description: '年間のメンバーシップ費用',
      unit: '円',
    },
    {
      key: 'line_notify_group_token',
      label: 'LINE Notifyトークン',
      description: 'グループ通知用のトークン',
      unit: '',
      isSecret: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            システム設定
          </h1>
          <p className="text-gray-600">アプリケーション全体の設定を管理</p>
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

        {/* Settings List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {settingsConfig.map((config) => {
              const setting = settings[config.key];
              const isEditing = editingKey === config.key;

              return (
                <div key={config.key} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {config.label}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                          <input
                            type={config.isSecret ? 'password' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder={`${config.label}を入力`}
                          />
                          {config.unit && (
                            <span className="text-gray-600 font-medium">{config.unit}</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-orange-600">
                            {config.isSecret && setting?.value
                              ? '••••••••••••'
                              : setting?.value || '未設定'}
                          </span>
                          {config.unit && !config.isSecret && (
                            <span className="text-gray-600 font-medium">{config.unit}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(config.key)}
                            className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            保存
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(config.key, setting?.value || '')}
                          className="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          編集
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">設定のヒント</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 締め切り日数と時刻は新規練習作成時のデフォルト値として使用されます</li>
                <li>• 1面あたり定員は参加者の上限計算に使用されます</li>
                <li>• 年会費はコート代の差額計算に使用されます</li>
                <li>• LINE Notifyトークンはグループ全体への通知に使用されます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
