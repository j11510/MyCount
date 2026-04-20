"use client";

import { useState, useEffect } from "react";
import { Baby, Download, ChevronLeft, ChevronRight, BookOpen, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function InfantExpenseStatistics() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [year, month]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Fetches AccountingRecord filtered by infant department category
      const res = await api.get(`/infant-expenses?year=${year}&month=${month}`);
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
      const response = await api.get(`/infant-expenses/export?year=${year}&month=${month}`, {
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

  const totalSum = records.reduce((sum: number, r: any) => sum + r.amount, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Baby className="w-8 h-8 text-blue-400" />
            영아부 지출 통계
          </h1>
          <p className="text-gray-400 mt-1">회계 장부에 등록된 영아부 지출 데이터를 집계하여 보여줍니다.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent">
          <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            이달의 총 지출
          </h3>
          <p className="text-3xl font-bold font-mono text-white">
            ₩{totalSum.toLocaleString()}
          </p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center gap-4 col-span-2">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
             <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-300 font-medium">데이터 출처 안내</p>
            <p className="text-xs text-gray-500 mt-1">이 화면의 데이터는 [회계 장부 관리] 메뉴에서 '영아부물품정리&소모품' 카테고리로 등록된 내역을 기반으로 자동 집계됩니다. 데이터 수정은 회계 장부 관리에서 진행해 주세요.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest text-left">
                <td className="px-6 py-4 w-20">NO</td>
                <td className="px-6 py-4">날짜</td>
                <td className="px-6 py-4">항목 (설명)</td>
                <td className="px-6 py-4">통장</td>
                <td className="px-6 py-4 text-right">지출 금액</td>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.map((record: any, idx: number) => (
                <tr key={record.id} className="hover:bg-white/5 transition-all text-sm">
                  <td className="px-6 py-4 font-mono text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-gray-400">{record.date}</td>
                  <td className="px-6 py-4 font-bold text-white">{record.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-blue-300 border border-blue-500/20">
                      {record.bank_account}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-white">
                    ₩{record.amount.toLocaleString()}
                  </td>
                </tr>
              ))}

              {records.length === 0 && !loading && (
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
