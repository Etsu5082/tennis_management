import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { practiceAPI } from '../services/api';
import { Practice } from '../types';

const AdminPractices: React.FC = () => {
  const { isAdmin } = useAuth();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showTextImport, setShowTextImport] = useState(false);
  const [textFile, setTextFile] = useState<File | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    courts: 2,
    capacity_per_court: 4,
    deadline_datetime: '',
    court_fee_per_court: 3600,
    status: 'open',
    notes: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchPractices();
    }
  }, [isAdmin]);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceAPI.getAll();
      setPractices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '練習一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (practiceId: number, date: string) => {
    if (!window.confirm(`${new Date(date).toLocaleDateString('ja-JP')}の練習を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await practiceAPI.delete(practiceId);
      setSuccessMessage('練習を削除しました');
      fetchPractices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || '練習の削除に失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTextImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!textFile) {
      setError('テキストファイルを選択してください');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const fileContent = await textFile.text();
      const response = await practiceAPI.importFromText(fileContent);
      const data = response.data;

      setSuccessMessage(`${data.created.length}件の練習を作成しました。${data.errors.length > 0 ? `${data.errors.length}件のエラーがありました。` : ''}`);
      setTextFile(null);
      setShowTextImport(false);
      fetchPractices();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'テキストインポートに失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      // If location is 'その他', use customLocation
      const dataToSubmit = {
        ...formData,
        location: formData.location === 'その他' ? customLocation : formData.location,
      };
      await practiceAPI.create(dataToSubmit);
      setSuccessMessage('練習日程を作成しました');
      setFormData({
        date: '',
        start_time: '',
        end_time: '',
        location: '',
        courts: 2,
        capacity_per_court: 4,
        deadline_datetime: '',
        court_fee_per_court: 3600,
        status: 'open',
        notes: '',
      });
      setCustomLocation('');
      setShowCreateForm(false);
      fetchPractices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || '練習日程の作成に失敗しました');
      setTimeout(() => setError(''), 3000);
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

  const filteredPractices =
    filterStatus === 'all'
      ? practices
      : practices.filter((p) => p.status === filterStatus);

  const upcomingPractices = filteredPractices.filter(
    (p) => new Date(p.date) >= new Date()
  );
  const pastPractices = filteredPractices.filter(
    (p) => new Date(p.date) < new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              練習日程管理
            </h1>
            <p className="text-gray-600">既存の練習日程の編集と削除</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTextImport(!showTextImport)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all"
            >
              テキストから一括登録
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              + 新規作成
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

        {/* Text Import Form */}
        {showTextImport && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">テキストファイルから一括登録</h3>
            <form onSubmit={handleTextImport} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">テキストファイル</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => setTextFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  r_info.txt形式のファイルをアップロードしてください。
                  <br />
                  「予約回数集計結果」セクションから練習日程を自動的に作成します。
                  <br />
                  予約者の氏名、利用者番号、学籍番号も自動的に紐付けられます。
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  disabled={!textFile}
                >
                  インポート
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTextImport(false);
                    setTextFile(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Practice Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">新しい練習日程を作成</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-6">
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
                  <select
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">選択してください</option>
                    <option value="城北中央公園">城北中央公園</option>
                    <option value="光が丘公園">光が丘公園</option>
                    <option value="木場公園">木場公園</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              </div>

              {/* Custom Location Input (shown when "その他" is selected) */}
              {formData.location === 'その他' && (
                <div>
                  <label htmlFor="customLocation" className="block text-sm font-bold text-gray-700 mb-2">
                    コート名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="customLocation"
                    required
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="例: 〇〇公園テニスコート"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

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
                  onClick={() => {
                    setShowCreateForm(false);
                    setCustomLocation('');
                    setFormData({
                      date: '',
                      start_time: '',
                      end_time: '',
                      location: '',
                      courts: 2,
                      capacity_per_court: 4,
                      deadline_datetime: '',
                      court_fee_per_court: 3600,
                      status: 'open',
                      notes: '',
                    });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
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
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              filterStatus === 'all'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              filterStatus === 'open'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            募集中
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              filterStatus === 'closed'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            締切済
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              filterStatus === 'cancelled'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            中止
          </button>
        </div>

        {/* Upcoming Practices */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📅</span>
            今後の練習 ({upcomingPractices.length})
          </h2>
          <div className="space-y-4">
            {upcomingPractices.map((practice) => (
              <div
                key={practice.id}
                className="p-6 border-2 border-gray-100 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {new Date(practice.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm font-bold rounded-lg ${
                          practice.status === 'open'
                            ? 'bg-emerald-100 text-emerald-700'
                            : practice.status === 'closed'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {practice.status === 'open'
                          ? '募集中'
                          : practice.status === 'closed'
                          ? '締切済'
                          : '中止'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-bold">時間:</span> {practice.start_time}
                      </div>
                      <div>
                        <span className="font-bold">場所:</span> {practice.location}
                      </div>
                      <div>
                        <span className="font-bold">面数:</span> {practice.courts}面
                      </div>
                      <div>
                        <span className="font-bold">締切:</span>{' '}
                        {new Date(practice.deadline_datetime).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/practices/${practice.id}`}
                      className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      詳細
                    </Link>
                    <button
                      onClick={() => handleDelete(practice.id, practice.date)}
                      className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {upcomingPractices.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📅</span>
                <p className="text-gray-500 text-lg">今後の練習はありません</p>
              </div>
            )}
          </div>
        </div>

        {/* Past Practices */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📋</span>
            過去の練習 ({pastPractices.length})
          </h2>
          <div className="space-y-4">
            {pastPractices.slice(0, 10).map((practice) => (
              <div
                key={practice.id}
                className="p-6 border-2 border-gray-100 rounded-xl hover:shadow-md transition-all opacity-75"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {new Date(practice.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </h3>
                      <span className="px-3 py-1 text-sm font-bold rounded-lg bg-gray-100 text-gray-700">
                        終了
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-bold">時間:</span> {practice.start_time}
                      </div>
                      <div>
                        <span className="font-bold">場所:</span> {practice.location}
                      </div>
                      <div>
                        <span className="font-bold">面数:</span> {practice.courts}面
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/practices/${practice.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {pastPractices.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📋</span>
                <p className="text-gray-500 text-lg">過去の練習はありません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPractices;
