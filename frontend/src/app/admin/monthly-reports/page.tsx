"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ChevronLeft, ChevronRight, Save, Plus, Trash2, Calendar, Users, Wallet } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function MonthlyReportManagement() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [reporter, setReporter] = useState("");
  const [planData, setPlanData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [remarks, setRemarks] = useState("");
  const [settlementStats, setSettlementStats] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch existing report data
      const reportRes = await api.get(`/monthly-reports?year=${year}&month=${month}`);
      if (reportRes.data) {
        const data = reportRes.data;
        setReporter(data.reporter || "");
        setPlanData(JSON.parse(data.plan_data || "[]"));
        setAttendanceData(JSON.parse(data.attendance_data || "[]"));
        setRemarks(data.remarks || "");
      } else {
        setReporter("");
        setPlanData([]);
        setAttendanceData([]);
        setRemarks("");
      }

      // 2. Fetch settlement totals for Infant Dept (Category ID 3 and similar)
      // For now we use the infant-expenses API which filters Category 3
      const settlementRes = await api.get(`/infant-expenses?year=${year}&month=${month}`);
      setSettlementStats(settlementRes.data);

      // 3. Fetch general balances (to show finances status)
      const balanceRes = await api.get(`/accounting/balances?year=${year}&month=${month}`);
      setBalances(balanceRes.data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/monthly-reports", {
        year,
        month,
        reporter,
        plan_data: JSON.stringify(planData),
        attendance_data: JSON.stringify(attendanceData),
        remarks
      });
      alert("보고서가 저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/monthly-reports/export?year=${year}&month=${month}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `monthly_report_${year}_${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert("엑셀 생성 중 오류가 발생했습니다. (백엔드 구현 확인 필요)");
    }
  };

  const addPlanRow = () => setPlanData([...planData, { item: "", budget: 0 }]);
  const removePlanRow = (idx: number) => setPlanData(planData.filter((_, i) => i !== idx));
  
  const addAttendanceRow = () => setAttendanceData([...attendanceData, { date: "", kids: "", total: "", donation: "", note: "" }]);
  const removeAttendanceRow = (idx: number) => setAttendanceData(attendanceData.filter((_, i) => i !== idx));

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setYear(newYear);
    setMonth(newMonth);
  };

  const infantTotalSettlement = settlementStats.reduce((sum, r) => sum + r.amount, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            월별 보고 및 계획
          </h1>
          <p className="text-gray-400 mt-1">영아부 사역 및 재정 보고서를 통합 관리합니다.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft className="w-5 h-5"/></button>
            <div className="px-4 font-bold text-lg min-w-[120px] text-center">{year}년 {month}월</div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronRight className="w-5 h-5"/></button>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50">
            <Save className="w-5 h-5" />
            {saving ? "저장 중..." : "데이터 저장"}
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-95">
            <Download className="w-5 h-5" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settlement (Auto) */}
        <section className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Wallet className="w-6 h-6 text-yellow-400" />
                금월 사업보고 (결산 - 재정통장)
              </h2>
              <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-tighter">Finance Account</span>
            </div>
          <div className="bg-black/20 rounded-2xl overflow-hidden border border-white/5">
             <table className="w-full text-sm">
                <thead className="bg-white/5 text-gray-500 font-bold text-[10px] uppercase">
                  <tr>
                    <td className="px-4 py-3">항목 (장부 적요)</td>
                    <td className="px-4 py-3 text-right">금액</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {settlementStats.map((s, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-all">
                      <td className="px-4 py-3 text-gray-300">{s.description}</td>
                      <td className="px-4 py-3 text-right text-white">₩{s.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/5 font-bold">
                    <td className="px-4 py-4 text-white">총 결산액</td>
                    <td className="px-4 py-4 text-right text-blue-400">₩{infantTotalSettlement.toLocaleString()}</td>
                  </tr>
                </tbody>
             </table>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">전월 이월금</p>
                <p className="text-xl font-bold font-mono">₩{(balances.finances?.opening || 0).toLocaleString()}</p>
             </div>
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">현재 잔액 (재정)</p>
                <p className="text-xl font-bold font-mono text-purple-400">₩{(balances.finances?.closing || 0).toLocaleString()}</p>
             </div>
          </div>
        </section>

        {/* Plan Input */}
        <section className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              차월 사업계획 (안)
            </h2>
            <button onClick={addPlanRow} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
             <div className="grid grid-cols-12 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                <div className="col-span-1">NO</div>
                <div className="col-span-7">사업 항목</div>
                <div className="col-span-3 text-right">예산(₩)</div>
                <div className="col-span-1"></div>
             </div>
             {planData.map((p, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                   <div className="col-span-1 text-xs text-gray-500 font-mono">{i+1}</div>
                   <input 
                    className="col-span-7 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="항목명"
                    value={p.item}
                    onChange={(e) => {
                      const newPlans = [...planData];
                      newPlans[i].item = e.target.value;
                      setPlanData(newPlans);
                    }}
                   />
                   <input 
                    type="number"
                    className="col-span-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-right font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                    value={p.budget}
                    onChange={(e) => {
                      const newPlans = [...planData];
                      newPlans[i].budget = parseInt(e.target.value) || 0;
                      setPlanData(newPlans);
                    }}
                   />
                   <button onClick={() => removePlanRow(i)} className="col-span-1 flex justify-center text-red-500/50 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4"/></button>
                </div>
             ))}
             {planData.length === 0 && <p className="text-center py-10 text-gray-600 text-sm italic">추가된 계획이 없습니다.</p>}
          </div>
        </section>
      </div>

      {/* Attendance Input */}
      <section className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
            출석 현황 및 헌금
          </h2>
          <button onClick={addAttendanceRow} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
             <thead>
                <tr className="bg-white/5 text-gray-500 text-[10px] font-bold uppercase tracking-widest text-left ring-1 ring-white/5">
                   <td className="px-6 py-4">주일/차수</td>
                   <td className="px-6 py-4">영아 출석</td>
                   <td className="px-6 py-4 text-purple-400">총원 (합계)</td>
                   <td className="px-6 py-4 text-blue-400">헌금액 (₩)</td>
                   <td className="px-6 py-4">특이사항</td>
                   <td className="px-6 py-4 w-10"></td>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {attendanceData.map((a, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-all">
                    <td className="px-4 py-2">
                      <input className="bg-transparent text-sm w-24 border-none focus:ring-0 p-0 text-white font-bold" value={a.date} onChange={(e) => { const nd = [...attendanceData]; nd[i].date = e.target.value; setAttendanceData(nd); }} placeholder="예: 2/1"/>
                    </td>
                    <td className="px-4 py-2">
                       <input type="number" className="bg-transparent text-sm w-20 border-none focus:ring-0 p-0 text-white" value={a.kids ?? ""} onChange={(e) => { const nd = [...attendanceData]; nd[i].kids = e.target.value; setAttendanceData(nd); }}/>
                    </td>
                    <td className="px-4 py-2">
                       <input type="number" className="bg-transparent text-sm w-20 border-none focus:ring-0 p-0 text-purple-400 font-bold" value={a.total ?? a.teachers ?? ""} onChange={(e) => { const nd = [...attendanceData]; nd[i].total = e.target.value; setAttendanceData(nd); }}/>
                    </td>
                    <td className="px-4 py-2">
                       <input type="number" className="bg-transparent text-sm w-32 border-none focus:ring-0 p-0 text-blue-400 font-bold" value={a.donation ?? ""} onChange={(e) => { const nd = [...attendanceData]; nd[i].donation = e.target.value; setAttendanceData(nd); }}/>
                    </td>
                    <td className="px-4 py-2">
                       <input className="bg-transparent text-xs w-full border-none focus:ring-0 p-0 text-gray-400" value={a.note} onChange={(e) => { const nd = [...attendanceData]; nd[i].note = e.target.value; setAttendanceData(nd); }} placeholder="비고 입력"/>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => removeAttendanceRow(i)} className="text-red-500/50 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </section>

      {/* reporter and remarks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="glass-panel p-6 rounded-3xl border border-white/10 md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">보고자 성함</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="예: 이금자 목사"
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
            />
         </div>
         <div className="glass-panel p-6 rounded-3xl border border-white/10 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">종합 특이사항 및 기도제목</label>
            <textarea 
              className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              placeholder="한 달 사역의 종합적인 내용이나 건의사항을 입력하세요."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
         </div>
      </div>
    </motion.div>
  );
}
