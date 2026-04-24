"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Plus, Trash2, Calendar, CreditCard, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, Edit3, Save, X, ArrowRight, RefreshCcw } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";

const ACCOUNTS = [
  { id: "finances", name: "재정 통장" },
  { id: "donations", name: "찬조금 통장" },
  { id: "meeting", name: "모임 통장" },
];

export default function AccountingTransactions() {
  const [activeAccount, setActiveAccount] = useState("finances");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [isEditingOpeningBalance, setIsEditingOpeningBalance] = useState(false);
  const [newOpeningBalance, setNewOpeningBalance] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form state
  const [entryType, setEntryType] = useState("expense");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const selected = categories.find(c => c.id.toString() === categoryId);
    if (selected && selected.type !== entryType) {
      setCategoryId("");
    }
  }, [entryType]);

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
  }, [activeAccount, year, month]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/accounting/categories");
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/accounting/transactions/${activeAccount}?year=${year}&month=${month}`);
      setTransactions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get(`/accounting/balances?year=${year}&month=${month}`);
      if (res.data[activeAccount]) {
        setOpeningBalance(res.data[activeAccount].opening);
        // We still fetch closing for calculations if needed, but we focus on opening
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOpeningBalance = async () => {
    try {
      await api.put(`/accounting/opening-balance`, {
        bank_account: activeAccount,
        year: year,
        month: month,
        opening_balance: parseInt(newOpeningBalance)
      });
      setIsEditingOpeningBalance(false);
      fetchBalance();
      fetchTransactions();
    } catch (e) {
      console.error(e);
      alert("이월잔고 수정 중 오류가 발생했습니다.");
    }
  };

  const handleToggleStatus = async (recordId: number, currentStatus: boolean) => {
    try {
      await api.put(`/accounting/transactions/${recordId}/status`, {
        is_processed: !currentStatus
      });
      fetchTransactions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCarryOver = async (id: number) => {
    if (!confirm("이 내역을 다음 달로 이월하시겠습니까? (정산 목록에서 다음 달로 이동합니다)")) return;
    try {
      await api.put(`/accounting/transactions/${id}/carry-over`);
      alert("다음 달로 이월되었습니다.");
      fetchTransactions();
      fetchBalance();
    } catch (e) {
      console.error(e);
      alert("이월 중 오류가 발생했습니다.");
    }
  };

  const handleResetPeriod = async (id: number) => {
    if (!confirm("이 내역의 정산 시점을 원래 날짜로 복구하시겠습니까?")) return;
    try {
      await api.put(`/accounting/transactions/${id}/reset-period`);
      alert("원래 날짜로 복구되었습니다.");
      fetchTransactions();
      fetchBalance();
    } catch (e) {
      console.error(e);
      alert("복구 중 오류가 발생했습니다.");
    }
  };

  const monthIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const monthNet = monthIncome - monthExpense;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    try {
      await api.post("/accounting/transactions", {
        bank_account: activeAccount,
        category_id: parseInt(categoryId),
        description,
        amount: parseInt(amount),
        type: entryType,
        payment_method: paymentMethod,
        remarks,
        date
      });
      setDescription(""); setAmount(""); setRemarks(""); setPaymentMethod("");
      fetchTransactions();
      fetchBalance();
    } catch (e: any) {
      alert(e.response?.data?.detail || "장부 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("이 내역을 삭제하시겠습니까? (삭제 시 해당 통장의 잔고도 다시 복구됩니다.)")) {
      try {
        await api.delete(`/accounting/transactions/${id}`);
        fetchTransactions();
        fetchBalance();
      } catch (e: any) {
        alert(e.response?.data?.detail || "내역 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setEditForm({
      category_id: t.category?.id || t.category_id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      remarks: t.remarks || "",
      date: t.date,
      bank_account: t.bank_account,
      payment_method: t.payment_method || "",
      accounting_year: t.accounting_year,
      accounting_month: t.accounting_month
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/accounting/transactions/${id}`, {
        ...editForm,
        category_id: parseInt(editForm.category_id),
        amount: parseInt(editForm.amount),
        accounting_year: editForm.accounting_year,
        accounting_month: editForm.accounting_month
      });
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchTransactions();
      fetchBalance();
    } catch (e: any) {
      alert(e.response?.data?.detail || "장부 수정 중 오류가 발생했습니다.");
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

  const handleExport = async (isAllTime: boolean) => {
    try {
      const url = isAllTime 
        ? `/accounting/export?bank_account=${activeAccount}`
        : `/accounting/export?bank_account=${activeAccount}&year=${year}&month=${month}`;
      
      const response = await api.get(url, { responseType: 'blob' });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = `ledger_${activeAccount}_${isAllTime ? 'all' : year + '_' + month}.xlsx`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert("엑셀 다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            회계 장부 관리
          </h1>
          <p className="text-gray-400 mt-1">통장별 입출금 내역 및 잔고를 실시간으로 관리하세요.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-1 mr-2 px-2 border-r border-white/10">
             <button onClick={() => handleExport(false)} className="text-[11px] bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-xl border border-green-500/20 transition-all">이달 엑셀</button>
             <button onClick={() => handleExport(true)} className="text-[11px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20 transition-all">전체 엑셀</button>
          </div>
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft className="w-5 h-5"/></button>
          <div className="px-4 font-bold text-lg min-w-[120px] text-center">
            {year}년 {month}월
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-4">
          {ACCOUNTS.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setActiveAccount(acc.id)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border ${activeAccount === acc.id ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'}`}
            >
              {acc.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent relative overflow-hidden flex flex-col justify-center min-h-[140px]">
          <h3 className="text-gray-400 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest relative z-10">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            기초 잔고 관리 (이월)
          </h3>
          <div className="relative z-10">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">이월 잔고</p>
            {isEditingOpeningBalance ? (
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={newOpeningBalance} 
                  onChange={(e) => setNewOpeningBalance(e.target.value)}
                  className="bg-black/40 border border-purple-500/50 text-white font-mono text-xl p-2 rounded-xl w-full outline-none"
                  autoFocus
                />
                <button onClick={handleUpdateOpeningBalance} className="p-2 bg-purple-600 rounded-xl hover:bg-purple-500 transition-all text-white"><Save className="w-5 h-5"/></button>
                <button onClick={() => setIsEditingOpeningBalance(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-gray-400"><X className="w-5 h-5"/></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tighter">
                  ₩{openingBalance.toLocaleString()}
                </p>
                <button 
                  onClick={() => {
                    setNewOpeningBalance(openingBalance.toString());
                    setIsEditingOpeningBalance(true);
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-purple-400 flex items-center gap-1 text-xs font-bold"
                >
                  <Edit3 className="w-4 h-4" />
                  금액 수정
                </button>
              </div>
            )}
            <p className="text-[10px] text-gray-500 mt-2 italic">* 이번 달 시작 금액을 직접 입력하세요.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent">
          <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            이달의 수입 (+)
          </h3>
          <p className="text-2xl font-bold font-mono text-blue-400">
            ₩{monthIncome.toLocaleString()}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-red-500/10 to-transparent">
          <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            이달의 지출 (-)
          </h3>
          <p className="text-2xl font-bold font-mono text-red-400">
            ₩{monthExpense.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 sticky top-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              내역 등록
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">구분</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setEntryType("income")} className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-sm ${entryType === 'income' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}`}><ArrowUpCircle className="w-4 h-4" />입금</button>
                  <button type="button" onClick={() => setEntryType("expense")} className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-sm ${entryType === 'expense' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}`}><ArrowDownCircle className="w-4 h-4" />지출</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">날짜</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">유형 (카테고리)</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" required>
                  <option value="">유형 선택</option>
                  {categories.filter(c => c.type === entryType || !c.type || c.type === 'general').map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">상세 내역</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="상세항목 입력" className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">금액</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">결재수단</label>
                <input type="text" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="현금, 카드, 계좌이체 등" className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">비고</label>
                <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="특이사항 입력" className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" />
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl transition-all mt-4">장부 등록</button>
            </form>
          </div>
        </div>

        {/* Transaction List */}
        <div className="lg:col-span-3">
          <div className="glass-panel overflow-x-auto border border-white/5 bg-white/5 rounded-3xl">
            <table className="w-full text-left border-collapse min-w-[1150px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[60px]">상태</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[110px]">날짜</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[120px]">유형</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[120px]">상세 내역</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-[120px]">금액</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-[130px]">잔액</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[100px]">수단</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[150px]">비고</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[120px] text-right">관련</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-sm">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={t.is_processed} 
                          onChange={() => handleToggleStatus(t.id, t.is_processed)}
                          className="w-4 h-4 rounded border-white/10 bg-black/40 accent-purple-500 cursor-pointer"
                        />
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{t.date}</td>
                    <td className="px-6 py-4" title={t.category?.name}>
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${t.type === 'income' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                        {t.category?.name && t.category.name.length > 5 ? t.category.name.substring(0, 5) + '...' : t.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white truncate max-w-[120px]" title={t.description}>
                      {t.description.length > 5 ? t.description.substring(0, 5) + '...' : t.description}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-blue-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-300">
                      {t.running_balance?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs truncate max-w-[100px]" title={t.payment_method}>
                      {t.payment_method && t.payment_method.length > 5 ? t.payment_method.substring(0, 5) + '...' : t.payment_method}
                    </td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-[150px] text-xs" title={t.remarks}>
                      {t.remarks && t.remarks.length > 5 ? t.remarks.substring(0, 5) + '...' : t.remarks}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      <button onClick={() => handleCarryOver(t.id)} title="다음 달로 이월" className="p-2 text-gray-400 hover:text-green-400 transition-all rounded-lg hover:bg-green-500/10"><ArrowRight className="w-4 h-4"/></button>
                      <button onClick={() => handleResetPeriod(t.id)} title="원래 날짜로 복구" className="p-2 text-gray-400 hover:text-yellow-400 transition-all rounded-lg hover:bg-yellow-500/10"><RefreshCcw className="w-4 h-4"/></button>
                      <button onClick={() => startEdit(t)} className="p-2 text-gray-400 hover:text-blue-400 transition-all rounded-lg hover:bg-blue-500/10"><Edit3 className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121214] border border-white/10 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-purple-400" />
                내역 수정
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">구분</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setEditForm({...editForm, type: 'income'})} className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-sm ${editForm.type === 'income' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}`}>입금</button>
                    <button type="button" onClick={() => setEditForm({...editForm, type: 'expense'})} className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-sm ${editForm.type === 'expense' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}`}>지출</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">날짜</label>
                  <input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">카테고리</label>
                <select value={editForm.category_id} onChange={(e) => setEditForm({...editForm, category_id: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none">
                  {categories.filter(c => c.type === editForm.type || !c.type || c.type === 'general').map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">상세 내역</label>
                <input type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">금액</label>
                  <input type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">결재수단</label>
                  <input type="text" value={editForm.payment_method} onChange={(e) => setEditForm({...editForm, payment_method: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">비고</label>
                <input type="text" value={editForm.remarks} onChange={(e) => setEditForm({...editForm, remarks: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" />
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 text-gray-400 transition-all">취소</button>
                <button onClick={() => handleUpdate(editingId!)} className="flex-1 py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl transition-all">수정 완료</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
