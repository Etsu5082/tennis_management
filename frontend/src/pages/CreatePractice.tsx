import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { practiceAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreatePractice: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    courts: 2,
    capacity_per_court: 4,
    deadline_datetime: '',
    court_fee_per_court: 0,
    status: 'open',
    notes: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await practiceAPI.create(formData);
      navigate('/admin/practices');
    } catch (err: any) {
      setError(err.response?.data?.error || '練習日程の作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2 mb-4"
          >
            <span>←</span>
            管理画面に戻る
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">練習日程登録</h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">
                  日付 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="start_time" className="block text-sm font-bold text-gray-700 mb-2">
                  開始時刻 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  required
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="end_time" className="block text-sm font-bold text-gray-700 mb-2">
                  終了時刻
                </label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2">
                  場所 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="例: 〇〇公園テニスコート"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Courts and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="courts" className="block text-sm font-bold text-gray-700 mb-2">
                  コート数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="courts"
                  name="courts"
                  required
                  min="1"
                  value={formData.courts}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="capacity_per_court" className="block text-sm font-bold text-gray-700 mb-2">
                  1面あたりの定員 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="capacity_per_court"
                  name="capacity_per_court"
                  required
                  min="1"
                  value={formData.capacity_per_court}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Deadline and Fee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="deadline_datetime" className="block text-sm font-bold text-gray-700 mb-2">
                  締切日時 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="deadline_datetime"
                  name="deadline_datetime"
                  required
                  value={formData.deadline_datetime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="court_fee_per_court" className="block text-sm font-bold text-gray-700 mb-2">
                  コート代（1面あたり） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="court_fee_per_court"
                  name="court_fee_per_court"
                  required
                  min="0"
                  value={formData.court_fee_per_court}
                  onChange={handleChange}
                  placeholder="円"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="open">募集中</option>
                <option value="closed">締切済</option>
                <option value="completed">終了</option>
                <option value="cancelled">中止</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-bold text-gray-700 mb-2">
                備考
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="注意事項や連絡事項など"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
              <h3 className="font-bold text-gray-900 mb-3">確認事項</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>
                    総定員: <strong>{formData.courts * formData.capacity_per_court}名</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>
                    1面あたりの参加者: <strong>{formData.capacity_per_court}名</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>
                    総コート代: <strong>{(formData.courts * formData.court_fee_per_court).toLocaleString()}円</strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '作成中...' : '練習日程を作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePractice;
