"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar, ArrowRight, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get("/monthly-records");
      setRecords(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/monthly-records", { year, month, current_balance: 0 });
      setShowModal(false);
      fetchRecords();
    } catch (e: any) {
      alert(e.response?.data?.detail || "기록 생성 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number, year: number, month: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`${year}년 ${month}월 기록을 삭제하시겠습니까?`)) {
      try {
        await api.delete(`/monthly-records/${id}`);
        fetchRecords();
      } catch (e) {
        console.error(e);
        alert("기록 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">월별 기록 목록</h1>
          <p className="text-gray-400 mt-1">월별 정산 내역 및 계산기를 관리하세요.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white hover:bg-gray-100 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
        >
          <Plus className="w-5 h-5" />
          새로운 달 작성
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {records.map((record: any) => (
          <Link key={record.id} href={`/admin/month/${record.id}`}>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/10 text-purple-300 rounded-xl group-hover:scale-110 transition-transform shadow-inner">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xl">{record.year}년 {record.month}월</h3>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <span className="text-xs tracking-wider text-gray-500 font-bold">현재 입력된 잔고액</span>
                <span className="text-lg font-medium text-purple-100 tracking-wide">₩{record.current_balance.toLocaleString()}</span>
              </div>
              <button
                onClick={(e) => handleDelete(e, record.id, record.year, record.month)}
                className="absolute bottom-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all z-20"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Link>
        ))}
        {records.length === 0 && (
          <div className="col-span-full border border-dashed border-white/10 bg-white/5 p-12 rounded-2xl text-center flex flex-col items-center justify-center">
             <Calendar className="w-12 h-12 text-gray-600 mb-4" />
             <p className="text-gray-400 font-medium tracking-wide">저장된 기록이 없습니다. 새로운 월을 추가하여 계산을 시작해보세요!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#121214] border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <h2 className="text-2xl font-bold mb-6 text-white">새로운 월 기록 생성</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-500 mb-2">연도 (Year)</label>
                  <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-500 mb-2">월 (Month)</label>
                  <input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" required />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">취소</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 transition-all w-24">생성</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
