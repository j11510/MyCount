"use client";

import { useState, useEffect } from "react";
import { Settings, Plus, Trash2, Tag } from "lucide-react";
import api from "@/lib/api";

import { motion } from "framer-motion";

export default function AccountingCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/me");
      setRole(res.data.role);
    } catch (e) {}
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/accounting/categories");
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/accounting/categories", { name, type: "general" });
      setName("");
      fetchCategories();
    } catch (e: any) {
      alert(e.response?.data?.detail || "항목 생성 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (confirm(`'${catName}' 항목을 삭제하시겠습니까? (연결된 장부 내역이 있다면 삭제가 불가능할 수 있습니다.)`)) {
      try {
        await api.delete(`/accounting/categories/${id}`);
        fetchCategories();
      } catch (e: any) {
        alert(e.response?.data?.detail || "항목 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
          <Settings className="w-8 h-8 text-purple-400" />
          회계 항목 관리
        </h1>
        <p className="text-gray-400 mt-1">장부 등록 시 사용할 유형 항목들을 관리하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        {role === 'admin' && (
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 h-max">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                신규 항목 추가
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">항목명</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 식비, 간식비, 헌금, 행사비 등"
                    className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none font-medium" 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg transition-all mt-2"
                >
                  추가하기
                </button>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className={role === 'admin' ? "lg:col-span-2" : "col-span-full"}>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-300">
              <Tag className="w-5 h-5" />
              등록된 항목 목록
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat: any) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl group border border-white/5">
                  <span className="font-medium">{cat.name}</span>
                   {role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p className="col-span-2 text-center text-gray-500 py-10 italic">등록된 항목이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
