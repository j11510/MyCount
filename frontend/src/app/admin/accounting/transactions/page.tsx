"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Plus, Trash2, Calendar, CreditCard, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, Edit3, Save, X } from "lucide-react";
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
  const [accountBalance, setAccountBalance] = useState<number>(0);
  
  // Form state
  const [entryType, setEntryType] = useState("expense");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");

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
      const res = await api.get("/accounting/accounts");
      const current = res.data.find((a: any) => a.code === activeAccount);
      if (current) {
        setAccountBalance(current.balance);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        remarks,
        date
      });
      setDescription(""); setAmount(""); setRemarks("");
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
      category_id: t.category_id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      remarks: t.remarks || "",
      date: t.date,
      bank_account: t.bank_account
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/accounting/transactions/${id}`, {
        ...editForm,
        category_id: parseInt(editForm.category_id),
        amount: parseInt(editForm.amount)
      });
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-3 flex gap-2 overflow-x-auto pb-2">
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
        <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex flex-col justify-center relative overflow-hidden group">
          <CreditCard className="absolute -right-4 -bottom-4 w-24 h-24 text-purple-500/10 rotate-12 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-1 relative z-10">
            <span className="text-xs font-bold text-purple-300 uppercase">현재 잔고</span>
            <Link href="/admin/accounting/accounts" className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg text-[10px] font-bold text-purple-300 transition-all">잔고 설정</Link>
          </div>
          <div className="text-2xl font-mono font-black text-white relative z-10">₩{accountBalance.toLocaleString()}</div>
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
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">날짜</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">유형</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">상세 내역</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">금액</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">비고</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-24">관련</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-sm">
                {transactions.map((t: any) => (
                  <tr key={t.id} className={`hover:bg-white/5 transition-all group ${editingId === t.id ? 'bg-purple-500/10' : ''}`}>
                    {editingId === t.id ? (
                      <>
                        <td className="px-4 py-2"><input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="bg-black/40 text-xs p-2 rounded w-full"/></td>
                        <td className="px-4 py-2">
                           <select value={editForm.category_id} onChange={(e) => setEditForm({...editForm, category_id: e.target.value})} className="bg-black/40 text-xs p-2 rounded w-full">
                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </td>
                        <td className="px-4 py-2"><input value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="bg-black/40 text-xs p-2 rounded w-full"/></td>
                        <td className="px-4 py-2"><input type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} className="bg-black/40 text-xs p-2 rounded w-full text-right"/></td>
                        <td className="px-4 py-2"><input value={editForm.remarks} onChange={(e) => setEditForm({...editForm, remarks: e.target.value})} className="bg-black/40 text-xs p-2 rounded w-full"/></td>
                        <td className="px-4 py-2 flex items-center gap-2">
                           <button onClick={() => handleUpdate(t.id)} className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg"><Save className="w-4 h-4"/></button>
                           <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-500/20 rounded-lg"><X className="w-4 h-4"/></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-gray-400">{t.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${t.type === 'income' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                            {t.category?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{t.description}</td>
                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-blue-400' : 'text-red-400'}`}>
                          {t.type === 'income' ? '+' : '-'} ₩{t.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-500 truncate max-w-[150px]">{t.remarks}</td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(t)} className="p-2 text-gray-400 hover:text-blue-400 transition-all rounded-lg hover:bg-blue-500/10"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
