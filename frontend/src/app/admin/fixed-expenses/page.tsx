"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import api from "../../../lib/api";
import { motion } from "framer-motion";

export default function FixedExpensesPage() {
  const [fixedItems, setFixedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/fixed-expenses");
      setFixedItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/fixed-expenses", { name, amount, is_active: true });
      setShowModal(false);
      setName("");
      setAmount(0);
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/fixed-expenses/${id}`);
      fetchItems();
    } catch (e) {}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">고정 지출 관리</h1>
          <p className="text-gray-400 mt-1 text-sm tracking-wide">새로운 월 항목 생성 시 자동 추가될 기본 템플릿을 관리하세요.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white hover:bg-gray-100 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          항목 추가
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-black/30 border-b border-white/10">
            <tr>
              <th className="p-4 text-xs tracking-wider text-gray-400 font-bold">항목명</th>
              <th className="p-4 text-xs tracking-wider text-gray-400 font-bold">기본 청구 금액</th>
              <th className="p-4 text-xs tracking-wider text-gray-400 font-bold text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {fixedItems.map((item: any) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 text-orange-400 p-2 rounded-lg">
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-white tracking-wide">{item.name}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-gray-300">
                  ₩{item.amount.toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {fixedItems.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 font-medium tracking-wide">
                  등록된 고정 지출 설정이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#121214] border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-rose-500" />
            <h2 className="text-2xl font-bold mb-6 text-white">고정 지출 등록</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">지출 내역명</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-orange-500 outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">기본 금액 (₩)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 p-3 font-mono text-white rounded-xl focus:border-orange-500 outline-none transition-colors" required />
              </div>
              <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">취소</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white shadow-lg shadow-orange-500/25 transition-all w-24">저장</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
