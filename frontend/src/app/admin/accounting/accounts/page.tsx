"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, Edit3, X, ArrowLeft, Wallet, Shield, History, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AccountingAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeHistoryAccount, setActiveHistoryAccount] = useState<any>(null);

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


  const openHistory = async (acc: any) => {
    setActiveHistoryAccount(acc);
    setIsHistoryModalOpen(true);
    setHistory([]);
    try {
      const res = await api.get(`/accounting/accounts/${acc.code}/history`);
      setHistory(res.data);
    } catch (e) {
      console.error(e);
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
          <p className="text-gray-400 mt-1">회계 장부 내역을 기반으로 산출된 현재 통장 잔고를 조회합니다.</p>
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
                  <button 
                    onClick={() => openHistory(acc)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-blue-400"
                    title="이력 보기"
                  >
                    <History className="w-5 h-5" />
                  </button>
              </div>

              <h2 className="text-xl font-bold text-white mb-1 relative z-10">{acc.display_name}</h2>
              <p className="text-xs text-gray-500 font-mono mb-6 relative z-10 uppercase tracking-widest">{acc.code}</p>

                <div className="relative z-10">
                  <span className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">현재 잔고</span>
                  <div className="text-3xl font-mono font-black text-white">
                    ₩{acc.balance.toLocaleString()}
                  </div>
                </div>
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
          <li>여기에 표시되는 잔고는 회계 장부에 등록된 모든 내역을 합산한 결과입니다.</li>
          <li>장부 내역을 등록, 수정 또는 삭제하면 실시간으로 잔고에 반영됩니다.</li>
          <li>잔고가 실제와 다를 경우, 장부 관리 메뉴에서 누락된 내역이나 잘못된 금액을 확인해 주세요.</li>
        </ul>
      </div>

      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <History className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{activeHistoryAccount?.display_name}</h3>
                    <p className="text-xs text-blue-400">잔고 변동 이력</p>
                  </div>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="py-20 text-center text-gray-500">이력이 존재하지 않습니다.</div>
                ) : (
                  history.map((h) => (
                    <div key={h.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl border ${h.change_amount >= 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-100'}`}>
                          {h.change_amount >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-0.5">{h.reason}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {h.target_date && (
                              <p className="text-[10px] text-blue-300 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                거래일: {h.target_date}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">
                              기록: {new Date(h.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${h.change_amount >= 0 ? 'text-green-400' : 'text-red-100'}`}>
                          {h.change_amount >= 0 ? '+' : ''}{h.change_amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500">계좌 잔액: {h.balance_after.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
