"use client";

import { useState, useEffect } from "react";
import { Baby, Download, ChevronLeft, ChevronRight, BookOpen, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function InfantExpenseStatistics() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [activeAccount, setActiveAccount] = useState("finances");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const ACCOUNTS = [
    { id: "finances", name: "재정 통장" },
    { id: "donations", name: "찬조금 통장" },
    { id: "meeting", name: "모임 통장" },
  ];

  useEffect(() => {
    fetchRecords();
  }, [year, month]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Fetches all stats and we filter by account on frontend
      const res = await api.get(`/accounting/stats?year=${year}&month=${month}`);
      setRecords(res.data);
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

  const handleExport = async () => {
    try {
      const response = await api.get(`/infant-expenses/export?year=${year}&month=${month}&bank_account=${activeAccount}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `infant_expense_${year}_${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert("엑셀 다운로드 중 오류가 발생했습니다.");
    }
  };

  const filteredRecords = records.filter(r => r.bank_account === activeAccount);
  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const totalSum = totalIncome - totalExpense;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Baby className="w-8 h-8 text-blue-400" />
            영아부 지출 통계
          </h1>
          <p className="text-gray-400 mt-1">통장별 카테고리 집계 현황을 확인하세요. (월별 보고는 <b>재정 통장</b> 기준)</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft className="w-5 h-5"/></button>
            <div className="px-4 font-bold text-lg min-w-[120px] text-center">
              {year}년 {month}월
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronRight className="w-5 h-5"/></button>
          </div>
          <button 
            onClick={handleExport}
            disabled={records.length === 0}
            className={`flex items-center gap-2 font-bold px-6 py-3 rounded-2xl transition-all shadow-lg ${records.length > 0 ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
          >
            <Download className="w-5 h-5" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
        {ACCOUNTS.map((acc) => (
          <button
            key={acc.id}
            onClick={() => setActiveAccount(acc.id)}
            className={`px-6 py-2 rounded-xl font-bold transition-all text-sm ${activeAccount === acc.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
          >
            {acc.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent">
          <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            이달의 수입 (+)
          </h3>
          <p className="text-3xl font-bold font-mono text-blue-400">
            ₩{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-red-500/10 to-transparent">
          <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            이달의 지출 (-)
          </h3>
          <p className="text-3xl font-bold font-mono text-red-400">
            ₩{totalExpense.toLocaleString()}
          </p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent">
          <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            최종 정산 금액
          </h3>
          <p className={`text-3xl font-bold font-mono ${totalSum >= 0 ? 'text-white' : 'text-red-400'}`}>
            {totalSum >= 0 ? '+' : '-'} ₩{Math.abs(totalSum).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest text-left">
                <td className="px-6 py-4 w-20">NO</td>
                <td className="px-6 py-4">카테고리명</td>
                <td className="px-6 py-4">구분</td>
                <td className="px-6 py-4 text-right">합계 금액</td>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.map((record: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/5 transition-all text-sm">
                  <td className="px-6 py-4 font-mono text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-white">{record.category_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] border ${record.type === 'income' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {record.type === 'income' ? '입금' : '지출'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${record.type === 'income' ? 'text-blue-400' : 'text-red-400'}`}>
                    {record.type === 'income' ? '+' : '-'} ₩{record.amount.toLocaleString()}
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BookOpen className="w-12 h-12 text-gray-700" />
                      <p className="text-gray-500 italic">해당 월의 장부 기록이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
