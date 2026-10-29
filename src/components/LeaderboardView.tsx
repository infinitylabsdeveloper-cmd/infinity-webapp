import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Trophy, Medal, Crown, Star, Users, Flame, ArrowUpRight, Award, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardViewProps {
  activeApp: AppConfig;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: string;
  accuracy: string;
  mockTests: number;
  badge?: string;
  isUser?: boolean;
  avatar?: string;
  tier?: string;
}

export default function LeaderboardView({ activeApp }: LeaderboardViewProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'state' | 'weekly'>('global');

  // Load real leaderboard rankings (empty by default until real test scores exist)
  const leaderboardData: LeaderboardEntry[] = React.useMemo(() => {
    try {
      const stored = localStorage.getItem(`app_leaderboard_${activeApp.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  }, [activeApp.id]);

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Banner — Bright Royal Champagne, Ivory & Rose Pink */}
      <div className="bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#FFE0EA] text-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-lg space-y-2 relative overflow-hidden border-2 border-amber-300">
        <div className="absolute right-4 top-4 opacity-15 text-9xl pointer-events-none">🏆</div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/90 text-[#1E1B4B] rounded-full text-xs font-black border border-amber-300 shadow-2xs">
            <span>🏆</span> Live All-India Aspirants Ranking
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1E1B4B]">Elite Leaderboard — {activeApp.name}</h2>
          <p className="text-xs text-slate-700 font-semibold">Compare your test scores, speed, and accuracy with top competitive exam aspirants across India.</p>
        </div>
      </div>

      {/* LEADERBOARD CONTAINER — Bright Ivory Pearl & Sapphire Sky */}
      <div className="bg-gradient-to-b from-[#FFF8E7] via-white to-[#DCEBFF]/50 rounded-3xl p-6 sm:p-8 text-[#1E1B4B] shadow-lg space-y-6 border-2 border-amber-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest bg-[#FFF1CC] px-3 py-1 rounded-full border border-amber-300">
              ⚡ Live Synchronized Rankings
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#1E1B4B]">Top State & National Achievers</h3>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-amber-300 shadow-2xs">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'global' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm font-black' : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
              }`}
            >
              🌍 Global Rank
            </button>
            <button
              onClick={() => setActiveTab('state')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'state' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm font-black' : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
              }`}
            >
              🇮🇳 Andhra Pradesh
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'weekly' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm font-black' : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
              }`}
            >
              ⚡ Weekly Star
            </button>
          </div>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="bg-gradient-to-br from-[#FFF1CC]/60 via-white to-[#D9FBE8]/60 rounded-3xl p-10 sm:p-14 text-center border-2 border-amber-300 shadow-sm space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-[#FFF1CC] text-amber-700 flex items-center justify-center mx-auto text-3xl font-black border border-amber-400 shadow-2xs">
              🏆
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="text-base sm:text-lg font-black text-[#1E1B4B]">No Leaderboard Rankings Available</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Live rankings will automatically appear here as aspirants participate in practice sessions and complete mock tests for {activeApp.name}.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
              {leaderboardData.slice(0, 3).map((item, idx) => (
                <div
                  key={item.rank}
                  className={`rounded-2xl p-2.5 sm:p-4 text-center flex flex-col items-center justify-between relative border-2 ${
                    idx === 0 
                      ? 'bg-gradient-to-b from-[#FFFCF0] via-[#FFF1CC] to-[#FFE4D1] border-amber-400 shadow-lg scale-105 z-10' 
                      : idx === 1
                        ? 'bg-gradient-to-b from-[#F4F9FF] via-[#DCEBFF] to-[#EDE7FF] border-sky-300 shadow-md'
                        : 'bg-gradient-to-b from-[#F2FEF7] via-[#D9FBE8] to-[#D8F7F5] border-emerald-300 shadow-md'
                  }`}
                >
                  <div className={`absolute -top-2.5 sm:-top-3 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs shadow-md ${
                    idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-sky-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    #{item.rank}
                  </div>

                  <div className="relative mt-1.5 sm:mt-2">
                    <img src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={item.name} className="h-10 w-10 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-amber-400 shadow-md" />
                    <span className="absolute bottom-0 right-0 text-[10px] sm:text-xs">👑</span>
                  </div>

                  <div className="space-y-0.5 mt-1.5 sm:mt-2 w-full">
                    <h4 className="text-[11px] sm:text-sm font-black text-[#1E1B4B] truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none mx-auto">{item.name}</h4>
                    <p className="text-[10px] sm:text-[11px] font-extrabold text-amber-800">{item.score}</p>
                  </div>

                  <span className="mt-1.5 sm:mt-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 border border-amber-200 text-[9px] sm:text-[10px] font-extrabold text-[#1E1B4B] truncate max-w-full">
                    {item.accuracy}
                  </span>
                </div>
              ))}
            </div>

            {/* Full Ranking List Table */}
            <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden divide-y divide-amber-100 shadow-sm">
              {leaderboardData.map((user) => (
                <div
                  key={user.rank}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    user.isUser ? 'bg-[#FFF1CC]/70 border-l-4 border-l-amber-500' : 'hover:bg-[#FFF8E7]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      user.rank === 1 ? 'bg-amber-500 text-white shadow-xs' :
                      user.rank === 2 ? 'bg-sky-600 text-white shadow-xs' :
                      user.rank === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-[#DCEBFF] text-[#1E1B4B] border border-sky-300'
                    }`}>
                      #{user.rank}
                    </span>

                    <div className="flex items-center gap-3">
                      <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={user.name} className="h-10 w-10 rounded-full object-cover border border-amber-300" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-[#1E1B4B]">{user.name}</h4>
                          {user.isUser && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold">{user.badge || 'Aspirant'} • {user.mockTests} Mock Tests</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-indigo-900">{user.score}</p>
                    <p className="text-[10px] text-emerald-700 font-extrabold">{user.accuracy} Accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-600 font-semibold">
            Leaderboard updates every 1 hour based on Grand Mock Test evaluations and daily quiz accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
