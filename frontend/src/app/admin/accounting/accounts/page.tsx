"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, Edit3, X, ArrowLeft, Wallet, Shield } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AccountingAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounting/accounts");
      setAccounts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (acc: any) => {
    setEditingCode(acc.code);
    setEditValue(acc.balance.toString());
  };

  const handleSave = async (code: string) => {
    try {
      // Update both absolute current balance and the anchor initial_balance
      await api.put(`/accounting/accounts/${code}/balance?balance=${editValue}`);
      await api.put(`/accounting/accounts/${code}/initial-balance?initial_balance=${editValue}`);
      setEditingCode(null);
      fetchAccounts();
    } catch (e: any) {
      alert(e.response?.data?.detail || "잔고 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Wallet className="w-8 h-8 text-purple-400" />
            통장 잔고 관리
          </h1>
          <p className="text-gray-400 mt-1">각 통장의 기초 잔고 또는 현재 잔고를 설정합니다.</p>
        </div>
        <Link 
          href="/admin/accounting/transactions"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-bold text-gray-300 border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          장부 관리로 돌아가기
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          accounts.map((acc) => (
            <div key={acc.code} className="glass-panel p-6 rounded-3xl border border-white/10 bg-white/5 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6">
                <CreditCard className="w-full h-full" />
              </div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                {editingCode !== acc.code ? (
                  <button 
                    onClick={() => handleStartEdit(acc)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setEditingCode(null)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1 relative z-10">{acc.display_name}</h2>
              <p className="text-xs text-gray-500 font-mono mb-6 relative z-10 uppercase tracking-widest">{acc.code}</p>

              {editingCode === acc.code ? (
                <div className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold text-purple-400 mb-2 uppercase tracking-widest">금액 설정</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-400">₩</span>
                      <input 
                        type="number" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-black/40 border border-purple-500/50 p-3 rounded-xl text-white font-mono text-xl font-bold outline-none focus:ring-2 ring-purple-500/20"
                        autoFocus
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSave(acc.code)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                  >
                    <Save className="w-4 h-4" />
                    저장하기
                  </button>
                </div>
              ) : (
                <div className="relative z-10">
                  <span className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">현재 잔고</span>
                  <div className="text-3xl font-mono font-black text-white">
                    ₩{acc.balance.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-12 p-6 rounded-3xl border border-blue-500/20 bg-blue-500/5 text-blue-300/80 text-sm">
        <p className="font-bold mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          안내 사항
        </p>
        <ul className="list-disc list-inside space-y-1 opacity-70">
          <li>여기서 설정하는 잔고는 해당 통장의 실제 현재 잔고를 의미합니다.</li>
          <li>입출금 내역을 등록하면 이 잔고에서 자동으로 더하거나 뺍니다.</li>
          <li>초기화 시 현재 통장에 있는 실물 잔액을 입력해 주세요.</li>
        </ul>
      </div>
    </motion.div>
  );
}
