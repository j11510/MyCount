"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Plus, Trash2, ArrowLeft, Target, DollarSign, TrendingUp, TrendingDown, Download } from "lucide-react";

export default function MonthDetail() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id;
  
  const [record, setRecord] = useState<any>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [items, setItems] = useState<any[]>([]);

  // Global Templates
  const [globalFixed, setGlobalFixed] = useState<any[]>([]);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState(0);

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState(0);

  useEffect(() => {
    fetchRecord();
    fetchGlobalFixed();
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      const res = await api.get(`/monthly-records/${recordId}`);
      setRecord(res.data);
      setCurrentBalance(res.data.current_balance);
      setItems(res.data.items);
    } catch (e) {
      console.error(e);
      router.push("/admin");
    }
  };

  const fetchGlobalFixed = async () => {
    try {
      const res = await api.get("/fixed-expenses");
      setGlobalFixed(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateBalance = async (val: number) => {
    try {
      setCurrentBalance(val);
      await api.put(`/monthly-records/${recordId}/balance?current_balance=${val}`);
    } catch (e) {}
  };

  const updateItemAmount = async (id: number, val: number) => {
    try {
      setItems(items.map(it => it.id === id ? { ...it, amount: val } : it));
      await api.put(`/monthly-items/${id}?amount=${val}`);
    } catch (e) {}
  };

  const deleteItem = async (id: number) => {
    try {
      await api.delete(`/monthly-items/${id}`);
      setItems(items.filter(it => it.id !== id));
    } catch (e) {}
  };

  const addVariableExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/monthly-records/${recordId}/items`, {
        name: expenseName, amount: expenseAmount, type: "variable_expense" 
      });
      setItems([...items, res.data]);
      setShowAddExpense(false);
      setExpenseName(""); setExpenseAmount(0);
    } catch (e) {}
  };

  const addIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/monthly-records/${recordId}/items`, {
        name: incomeName, amount: incomeAmount, type: "income" 
      });
      setItems([...items, res.data]);
      setShowAddIncome(false);
      setIncomeName(""); setIncomeAmount(0);
    } catch (e) {}
  };

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "manual") return;
    const tpl = globalFixed.find(t => t.id === Number(val));
    if (tpl) {
      setExpenseName(tpl.name);
      setExpenseAmount(tpl.amount);
    }
  };

  const exportToExcel = () => {
    if (!record) return;

    const workbookData = [
      ["[MyCount] 월별 정산 내역 세부사항", "", ""],
      ["기간", `${record.year}년 ${record.month}월`, ""],
      ["", "", ""],
      ["[1] 주요 파라미터", "", ""],
      ["구분", "항목명", "금액 (unit: KRW)"],
      ["파라미터", "1. 총 마이너스 고정금액", totalFixed],
      ["파라미터", "2. 현재 통장 잔고액", currentBalance],
      ["파라미터", "3. 남은금액 (1-2)", baseShortfall],
      ["", "", ""],
      ["[2] 고정 지출 상세 (자동 등록)", "", ""],
      ["구분", "내역명", "금액"],
      ...fixedExpenses.map(item => ["고정지출", item.name, item.amount]),
      ["합계", "총 자동 고정 지출", totalActualFixed],
      ["", "", ""],
      ["[3] 변동 지출 상세 (추가 입력)", "", ""],
      ["구분", "내역명", "금액"],
      ...variableExpenses.map(item => ["변동지출", item.name, item.amount]),
      ["합계", "총 추가 변동 지출", totalVariable],
      ["", "", ""],
      ["[4] 추가 수입 상세", "", ""],
      ["구분", "내역명", "금액"],
      ...incomes.map(item => ["수입", item.name, item.amount]),
      ["합계", "계산된 총 수입", totalIncomes],
      ["", "", ""],
      ["[5] 최종 결과 리포트", "", ""],
      ["구분", "항목명", "금액"],
      ["중간결과", "모든 지출 차감 후 예상 잔고", balanceAfterExpenses],
      ["결론", "이달에 내가 채워넣어야 할 (필요한) 자금", Math.abs(finalNeeded)],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(workbookData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "정산내역");

    // 기본 너비 설정
    const wscols = [{ wch: 15 }, { wch: 35 }, { wch: 20 }];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(workbook, `MyCount_${record.year}년_${record.month}월_정산내역.xlsx`);
  };

  if (!record) return null;

  const fixedExpenses = items.filter(i => i.type === "fixed_expense");
  const variableExpenses = items.filter(i => i.type === "variable_expense");
  const incomes = items.filter(i => i.type === "income");

  // 총 마이너스 고정금액 3,500만원 고정
  const totalFixed = 35000000;
  const totalActualFixed = fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalVariable = variableExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  const baseShortfall = totalFixed - currentBalance;
  const balanceAfterExpenses = baseShortfall - (totalActualFixed + totalVariable);
  const finalNeeded = balanceAfterExpenses + totalIncomes;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10 relative">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/admin")} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            {record.year}년 {record.month}월 세부 정산 계산기
          </h1>
          <p className="text-gray-400 mt-1 text-sm tracking-wide">항목별 지출을 확인하고 최종 필요 금액을 산출해보세요.</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/30 transition-all font-bold text-sm shadow-lg shadow-emerald-500/5 group"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Calculation Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Top Panel */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8" />
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10"><Target className="w-5 h-5 text-purple-400"/> 메인 파라미터</h2>
             
             <div className="space-y-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 tracking-wider">1. 총 마이너스 고정금액 (지출 합계)</span>
                  </div>
                  <span className="text-xl font-mono text-pink-400 font-semibold">₩{totalFixed.toLocaleString()}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-purple-300 tracking-wider">2. 현재 통장 잔고액</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">현재 실제 계좌에 보유 중인 금액을 입력하세요.</span>
                  </div>
                  <input 
                    type="number"
                    value={currentBalance}
                    onChange={(e) => updateBalance(Number(e.target.value))}
                    className="w-full md:w-48 bg-black/50 border border-purple-500/30 p-2 font-mono text-white rounded-lg focus:border-purple-400 outline-none text-left md:text-right transition-colors"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/60 rounded-xl border border-white/10 shadow-inner gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 tracking-wider">3. 남은금액</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">(총 고정 지출액) - (통장 잔고액)</span>
                  </div>
                  <span className={`text-xl font-mono font-bold ${baseShortfall > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    ₩{baseShortfall.toLocaleString()}
                  </span>
                </div>
             </div>
          </div>

          {/* Fixed Expenses List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold flex items-center gap-2"><TrendingDown className="w-5 h-5 text-orange-400"/> 자동 등록된 고정 지출액</h2>
             </div>
             <div className="space-y-2">
               {fixedExpenses.map(item => (
                 <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-black/30 rounded-xl group/item border border-transparent hover:border-white/10 transition-colors">
                   <span className="font-medium text-gray-300 mb-2 md:mb-0">{item.name}</span>
                   <div className="flex items-center gap-3">
                     <span className="text-[11px] text-gray-500 hidden md:block">이번 달 요금 변경 (1회성):</span>
                     <input 
                       type="number" 
                       value={item.amount}
                       onChange={(e) => updateItemAmount(item.id, Number(e.target.value))}
                       className="w-full md:w-32 bg-black/50 border border-white/10 p-2 font-mono text-sm text-left md:text-right rounded-lg focus:border-orange-500 outline-none transition-colors"
                     />
                   </div>
                 </div>
               ))}
               {fixedExpenses.length === 0 && <p className="text-sm text-gray-500 bg-black/20 p-4 rounded-xl border border-white/5">자동으로 등록된 내역이 없습니다.</p>}
               {fixedExpenses.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm p-2 bg-white/5 rounded-xl">
                   <span className="font-bold text-gray-400 text-[11px]">총 자동 고정 지출 합계</span>
                   <span className="font-mono font-bold text-white text-lg">₩{totalActualFixed.toLocaleString()}</span>
                 </div>
               )}
             </div>
          </div>

          {/* Variable Expenses List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -mr-8 -mt-8" />
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-10 gap-4">
               <h2 className="text-lg font-bold flex items-center gap-2"><TrendingDown className="w-5 h-5 text-red-500"/> 월별 추가 변동 지출액</h2>
               <button onClick={() => setShowAddExpense(true)} className="text-xs font-bold tracking-wider text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                 <Plus className="w-4 h-4" /> 내역 쓰기
               </button>
             </div>
             
             {showAddExpense && (
               <form onSubmit={addVariableExpense} className="mb-6 p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col gap-4 relative z-10 shadow-inner">
                 
                 <div className="w-full mb-1">
                   <label className="block text-xs font-bold text-gray-400 mb-1">사전에 등록한 고정지출 템플릿 불러오기</label>
                   <select 
                     onChange={handleTemplateSelect} 
                     defaultValue="manual"
                     className="w-full bg-black/50 border border-white/10 p-2.5 text-white text-sm rounded-lg focus:border-red-500 outline-none transition-colors"
                   >
                     <option value="manual">-- 빠른 불러오기 선택 (-- 수동 입력 가능) --</option>
                     {globalFixed.map(t => (
                       <option key={t.id} value={t.id}>{t.name} (₩{t.amount.toLocaleString()})</option>
                     ))}
                   </select>
                 </div>

                 <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                   <div className="flex-1 w-full">
                     <label className="block text-xs font-bold text-gray-400 mb-1">사용 내역명</label>
                     <input type="text" value={expenseName} onChange={e=>setExpenseName(e.target.value)} className="w-full bg-black/50 border border-white/10 p-2.5 text-white text-sm rounded-lg focus:border-red-500 outline-none transition-colors" required placeholder="직접 입력" />
                   </div>
                   <div className="flex-1 w-full">
                     <label className="block text-xs font-bold text-gray-400 mb-1">사용 금액 (₩)</label>
                     <input type="number" value={expenseAmount} onChange={e=>setExpenseAmount(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 p-2.5 font-mono text-sm text-white rounded-lg focus:border-red-500 outline-none transition-colors" required />
                   </div>
                   <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 pt-1">
                     <button type="button" onClick={()=>setShowAddExpense(false)} className="flex-1 md:flex-none px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">취소</button>
                     <button type="submit" className="flex-1 md:flex-none px-4 py-2 text-sm bg-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-colors shadow-lg">저장</button>
                   </div>
                 </div>
               </form>
             )}

             <div className="space-y-2 relative z-10">
               {variableExpenses.map(item => (
                 <div key={item.id} className="flex items-center justify-between p-3.5 bg-black/30 rounded-xl group/item border border-transparent hover:border-white/5 transition-colors">
                   <span className="font-medium text-gray-300">{item.name}</span>
                   <div className="flex items-center gap-4">
                     <span className="font-mono text-red-300 text-sm md:text-base">₩{item.amount.toLocaleString()}</span>
                     <button onClick={() => deleteItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded flex items-center justify-center">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               ))}
               {variableExpenses.length === 0 && <p className="text-sm text-gray-500 bg-black/20 p-4 rounded-xl border border-white/5">입력된 변동 지출 내역이 없습니다.</p>}
             </div>
             
             <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-sm relative z-10 p-2 bg-white/5 rounded-xl">
               <span className="font-bold text-gray-400 text-[11px]">총 변동 지출 규모</span>
               <span className="font-mono font-bold text-white text-lg">₩{totalVariable.toLocaleString()}</span>
             </div>
          </div>

        </div>

        {/* Sidebar Calculation & Incomes */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-b from-[#1a1a24] to-[#0f0f12] border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><DollarSign className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" /> 최종 정산 브리핑</h2>
            
            <div className="space-y-6">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <span className="block text-[11px] text-gray-400 font-bold tracking-wider mb-2">모든 지출 차감 후 예상 잔고</span>
                <span className={`text-2xl font-mono font-bold ${balanceAfterExpenses >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ₩{balanceAfterExpenses.toLocaleString()}
                </span>
                <p className="text-[10px] text-gray-500 mt-2 leading-snug">
                  3. 남은금액 - (자동 고정 지출 + 추가 변동 지출)
                </p>
              </div>

              {/* Incomes Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4 bg-emerald-500/5 px-4 py-3 rounded-xl border border-emerald-500/10">
                  <span className="text-[11px] text-emerald-400 font-bold tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> 나의 추가 수입 목록
                  </span>
                  <button onClick={() => setShowAddIncome(true)} className="text-emerald-400 hover:text-white hover:bg-emerald-500 p-1.5 rounded-lg transition-all shadow-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <AnimatePresence>
                {showAddIncome && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={addIncome} 
                    className="mb-4 p-4 bg-black/40 rounded-xl border border-emerald-500/20 shadow-inner overflow-hidden"
                  >
                    <input type="text" placeholder="입금 사유명" value={incomeName} onChange={e=>setIncomeName(e.target.value)} className="w-full bg-transparent text-sm text-white mb-3 pb-2 border-b border-white/10 focus:border-emerald-500 outline-none transition-colors" required />
                    <input type="number" placeholder="금액" value={incomeAmount} onChange={e=>setIncomeAmount(Number(e.target.value))} className="w-full bg-transparent font-mono text-sm text-white mb-4 pb-2 border-b border-white/10 focus:border-emerald-500 outline-none transition-colors" required />
                    <div className="flex gap-2">
                       <button type="submit" className="flex-1 bg-emerald-500/20 text-emerald-400 text-xs py-2 rounded-lg font-bold hover:bg-emerald-500/40 transition-colors">수입 내역 등록</button>
                       <button type="button" onClick={()=>setShowAddIncome(false)} className="flex-1 text-gray-400 text-xs py-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">취소</button>
                    </div>
                  </motion.form>
                )}
                </AnimatePresence>

                <div className="space-y-2 mb-4">
                  {incomes.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-500/5 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/10 px-3 py-2.5 rounded-xl group/inc transition-all gap-2">
                      <span className="text-sm text-gray-300 font-medium">{item.name}</span>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                        <span className="font-mono text-sm text-emerald-300 font-semibold">₩{item.amount.toLocaleString()}</span>
                        <button onClick={() => deleteItem(item.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-md">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {incomes.length === 0 && <p className="text-xs text-gray-500 text-center py-2">등록된 수입이 없습니다.</p>}
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-400 bg-white/5 p-3 rounded-xl">
                  <span className="font-bold">계산된 총 수입</span>
                  <span className="font-mono text-emerald-300 font-bold text-sm">₩{totalIncomes.toLocaleString()}</span>
                </div>
              </div>

              {/* The Grand Finale */}
              <div className="pt-6 relative z-10">
                <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 p-4 sm:p-6 rounded-2xl border border-pink-500/40 text-center shadow-[0_0_30px_rgba(236,72,153,0.15)] relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <span className="relative z-10 block text-xs font-bold text-pink-300 mb-3 break-keep">결론: 이달에 내가 채워넣어야 할 (필요한) 자금</span>
                  <span className="relative z-10 block font-mono font-extrabold text-white drop-shadow-md py-1 whitespace-nowrap text-[clamp(1.5rem,5vw,2.25rem)]">
                    {Math.abs(finalNeeded).toLocaleString()}
                  </span>
                  <p className="relative z-10 text-[10px] text-pink-200/50 mt-4 font-semibold">
                    (모든 지출 차감 후 예상 잔고) + (계산된 총 수입)
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
