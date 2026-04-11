"use client";

import { useState, useEffect } from "react";
import { BarChart3, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PieChart, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import api from "@/lib/api";

import { motion } from "framer-motion";

const ACCOUNT_LABELS: Record<string, string> = {
  finances: "재정 통장",
  donations: "찬조금 통장",
  meeting: "모임 통장",
};

export default function AccountingStats() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [year, month]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/accounting/stats?year=${year}&month=${month}`);
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setYear(newYear);
    setMonth(newMonth);
  };

  const groupedStats = stats.reduce((acc: any, curr: any) => {
    if (!acc[curr.bank_account]) acc[curr.bank_account] = { income: [], expense: [], total_income: 0, total_expense: 0 };
    if (curr.type === 'income') {
      acc[curr.bank_account].income.push(curr);
      acc[curr.bank_account].total_income += curr.amount;
    } else {
      acc[curr.bank_account].expense.push(curr);
      acc[curr.bank_account].total_expense += curr.amount;
    }
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            회계 통계
          </h1>
          <p className="text-gray-400 mt-1">월별, 항목별 재정 현황을 한눈에 파악하세요.</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft className="w-5 h-5"/></button>
          <div className="px-4 font-bold text-lg min-w-[120px] text-center">
            {year}년 {month}월
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {Object.keys(ACCOUNT_LABELS).map((accKey) => {
          const accData = groupedStats[accKey] || { total_income: 0, total_expense: 0 };
          return (
            <div key={accKey} className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all">
                <PieChart className="w-20 h-20" />
              </div>
              <h3 className="text-gray-400 font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                {ACCOUNT_LABELS[accKey]}
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-blue-400"/> 총 입금</span>
                  <span className="text-xl font-mono font-bold text-blue-400">₩{accData.total_income.toLocaleString()}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1"><TrendingDown className="w-4 h-4 text-red-400"/> 총 지출</span>
                  <span className="text-xl font-mono font-bold text-red-400">₩{accData.total_expense.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-end justify-between">
                  <span className="text-sm font-bold text-white">순수계 (차액)</span>
                  <span className={`text-2xl font-mono font-bold ${accData.total_income - accData.total_expense >= 0 ? 'text-white' : 'text-orange-400'}`}>
                    ₩{(accData.total_income - accData.total_expense).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.keys(groupedStats).map((accKey) => (
          <div key={accKey} className="glass-panel rounded-3xl border border-white/5 bg-white/5 overflow-hidden">
            <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between font-bold">
              <span>{ACCOUNT_LABELS[accKey]} 상세 분포</span>
              <span className="text-xs text-gray-500">항목별 합계</span>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4" /> 입금 내역
                  </h4>
                  <div className="space-y-2">
                    {groupedStats[accKey].income.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                        <span className="text-sm">{s.category_name}</span>
                        <span className="font-mono font-bold">₩{s.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {groupedStats[accKey].income.length === 0 && <p className="text-xs text-gray-600 text-center py-2 italic">입금 기록 없음</p>}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4" /> 지출 내역
                  </h4>
                  <div className="space-y-2">
                    {groupedStats[accKey].expense.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                        <span className="text-sm">{s.category_name}</span>
                        <span className="font-mono font-bold">₩{s.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {groupedStats[accKey].expense.length === 0 && <p className="text-xs text-gray-600 text-center py-2 italic">지출 기록 없음</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
