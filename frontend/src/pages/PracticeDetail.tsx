import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Practice, Participation, ParticipationStats } from '../types';
import { practiceAPI, participationAPI, ballBagAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface BallBagHolder {
  ball_bag_id: number;
  ball_bag_name: string;
  user_id: number;
  user_name: string;
}

const PracticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [stats, setStats] = useState<ParticipationStats | null>(null);
  const [ballBagHolders, setBallBagHolders] = useState<BallBagHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myParticipation, setMyParticipation] = useState<Participation | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const practiceId = parseInt(id!);

      const [practiceRes, participationsRes, statsRes] = await Promise.all([
        practiceAPI.getById(practiceId),
        participationAPI.getByPractice(practiceId),
        participationAPI.getStats(practiceId),
      ]);

      setPractice(practiceRes.data);
      setParticipations(participationsRes.data);
      setStats(statsRes.data);

      // Find current user's participation
      const myPart = participationsRes.data.find(
        (p: Participation) => p.user_id === user?.id
      );
      setMyParticipation(myPart || null);

      // Fetch ball bag holders
      try {
        const holdersRes = await ballBagAPI.getHolders(practiceId);
        setBallBagHolders(holdersRes.data);
      } catch (error) {
        // Ball bag holders might not exist, that's okay
        setBallBagHolders([]);
      }
    } catch (error) {
      console.error('Failed to fetch practice details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async (status: 'attending' | 'late' | 'absent') => {
    try {
      setSubmitting(true);
      await participationAPI.create({
        practice_id: parseInt(id!),
        status,
      });
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || '参加申し込みに失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (!myParticipation) return;
    if (!window.confirm('参加をキャンセルしますか？')) return;

    try {
      setSubmitting(true);
      await participationAPI.delete(myParticipation.id);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'キャンセルに失敗しました');
    } finally {
      setSubmitting(false);
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

  if (!practice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">❌</span>
            <p className="text-xl text-gray-600">練習が見つかりませんでした</p>
            <button
              onClick={() => navigate('/practices')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const capacity = practice.courts * practice.capacity_per_court;
  const attendingCount = stats?.attending || 0;
  const isFull = attendingCount >= capacity;
  const isDeadlinePassed = new Date(practice.deadline_datetime) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/practices')}
            className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2 mb-4"
          >
            <span>←</span>
            一覧に戻る
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Practice Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {new Date(practice.date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </h1>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <span className="font-semibold">{practice.start_time}</span>
                    {practice.end_time && (
                      <>
                        <span className="mx-2">〜</span>
                        <span className="font-semibold">{practice.end_time}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">📍</span>
                  <span className="font-semibold">{practice.location}</span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">🎾</span>
                  <span className="font-semibold">
                    {practice.courts}面（定員: {capacity}名）
                  </span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">💰</span>
                  <span className="font-semibold">
                    {practice.court_fee_per_court.toLocaleString()}円/面
                  </span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <span className="text-gray-600">締切: </span>
                    <span className="font-semibold">
                      {new Date(practice.deadline_datetime).toLocaleString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>

              {practice.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">備考</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{practice.notes}</p>
                </div>
              )}
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">参加者一覧</h2>

              {participations.length > 0 ? (
                <div className="space-y-3">
                  {participations.map((participation) => (
                    <div
                      key={participation.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                          {participation.user_name?.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {participation.user_name}
                        </span>
                      </div>
                      {getStatusBadge(participation.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  まだ参加者がいません
                </div>
              )}
            </div>

            {/* Ball Bag Holders Section */}
            {ballBagHolders.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🎒</span>
                  <h2 className="text-2xl font-bold text-gray-900">ボルバ持ち帰り担当者</h2>
                </div>

                <div className="space-y-4">
                  {ballBagHolders.map((holder) => (
                    <div
                      key={holder.ball_bag_id}
                      className="flex items-center justify-between p-4 bg-white border-2 border-amber-200 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          🎾
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{holder.ball_bag_name}</div>
                          <div className="text-amber-700 font-semibold">{holder.user_name}</div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-amber-100 text-amber-800 font-bold rounded-lg">
                        担当
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-white/50 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-600">
                    💡 ボルバ担当者は練習当日、ボール袋を持参してください
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">参加状況</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">参加</span>
                  <span className="font-bold text-green-600">{stats?.attending || 0}名</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">遅刻</span>
                  <span className="font-bold text-yellow-600">{stats?.late || 0}名</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">不参加</span>
                  <span className="font-bold text-gray-600">{stats?.absent || 0}名</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">キャンセル待ち</span>
                  <span className="font-bold text-blue-600">{stats?.waitlist || 0}名</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">定員</span>
                    <span className="font-bold text-gray-900">
                      {attendingCount} / {capacity}名
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {myParticipation ? (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">あなたの参加状況</h3>
                  <div className="mb-4">
                    {getStatusBadge(myParticipation.status)}
                  </div>
                  <button
                    onClick={handleCancelParticipation}
                    disabled={submitting || isDeadlinePassed}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'キャンセル中...' : '参加をキャンセル'}
                  </button>
                  {isDeadlinePassed && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      締切を過ぎています
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">参加申し込み</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleParticipate('attending')}
                      disabled={submitting || isDeadlinePassed || practice.status !== 'open'}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '申し込み中...' : '参加する'}
                    </button>
                    <button
                      onClick={() => handleParticipate('late')}
                      disabled={submitting || isDeadlinePassed || practice.status !== 'open'}
                      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '申し込み中...' : '遅刻して参加'}
                    </button>
                    <button
                      onClick={() => handleParticipate('absent')}
                      disabled={submitting || isDeadlinePassed || practice.status !== 'open'}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '申し込み中...' : '不参加'}
                    </button>
                  </div>
                  {isDeadlinePassed && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      締切を過ぎています
                    </p>
                  )}
                  {practice.status !== 'open' && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      この練習は募集を締め切りました
                    </p>
                  )}
                  {isFull && practice.status === 'open' && !isDeadlinePassed && (
                    <p className="text-sm text-amber-600 mt-2 text-center font-semibold">
                      定員に達しています（キャンセル待ちになります）
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeDetail;
