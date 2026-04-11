"use client";

import { useState, useEffect } from "react";
import { Heart, Plus, Trash2, Download, Calendar, ChevronLeft, ChevronRight, User } from "lucide-react";
import api from "@/lib/api";

import { motion } from "framer-motion";

export default function DonationManagement() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [memberName, setMemberName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchRecords();
  }, [year, month]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/donations?year=${year}&month=${month}`);
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

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !amount || !date) return;

    try {
      await api.post("/donations", {
        member_name: memberName,
        amount: parseInt(amount),
        date: date
      });
      setMemberName("");
      setAmount("");
      setShowAddForm(false);
      fetchRecords();
    } catch (e) {
      console.error(e);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/donations/${id}`);
      fetchRecords();
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/donations/export?year=${year}&month=${month}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donation_${year}_${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert("엑셀 다운로드 중 오류가 발생했습니다.");
    }
  };

  const totalAmount = records.reduce((sum: number, r: any) => sum + r.amount, 0);

  // Grouping logic for daily totals
  const groupedRecords = records.reduce((acc: any, record: any) => {
    const date = record.date;
    if (!acc[date]) acc[date] = { sum: 0, items: [] };
    acc[date].items.push(record);
    acc[date].sum += record.amount;
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            헌금 관리
          </h1>
          <p className="text-gray-400 mt-1">성도님들의 소중한 헌금 내역을 일별로 관리합니다.</p>
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
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
            title="엑셀 다운로드"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/10 to-transparent">
            <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              이달의 총액
            </h3>
            <p className="text-3xl font-bold font-mono text-white">
              ₩{totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-white/5"
            >
              <Plus className="w-5 h-5" />
              내역 등록하기
            </button>

            {showAddForm && (
              <motion.form 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAddDonation} 
                className="mt-6 space-y-4 pt-6 border-t border-white/10"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">성함</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 pl-10 text-white rounded-xl focus:border-pink-500 outline-none transition-all" 
                      placeholder="홍길동"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">금액</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 font-bold">₩</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 pl-8 text-white rounded-xl focus:border-pink-500 outline-none transition-all" 
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">날짜</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 pl-10 text-white rounded-xl focus:border-pink-500 outline-none transition-all" 
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-pink-500/20"
                >
                  등록 완료
                </button>
              </motion.form>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {sortedDates.map((dateString) => (
            <motion.div 
              key={dateString}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-white text-lg">{dateString}</span>
                </div>
                <div className="bg-pink-500/20 px-4 py-1.5 rounded-xl border border-pink-500/30">
                  <span className="text-xs text-pink-300 font-bold mr-2 uppercase">Daily Total</span>
                  <span className="font-mono font-bold text-pink-100 text-lg">
                    ₩{groupedRecords[dateString].sum.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody className="divide-y divide-white/5">
                    {groupedRecords[dateString].items.map((record: any) => (
                      <tr 
                        key={record.id} 
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/10 flex items-center justify-center text-[11px] font-bold text-pink-300 border border-white/5">
                              {record.member_name.charAt(0)}
                            </div>
                            <span className="font-bold text-white">{record.member_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-white text-lg">
                          ₩{record.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center w-20">
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
          
          {records.length === 0 && !loading && (
            <div className="glass-panel py-20 text-center text-gray-500 italic rounded-3xl border border-white/10 border-dashed">
              기록된 헌금 내역이 없습니다.
            </div>
          )}
          {loading && (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

