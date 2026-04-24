"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Trash2, Shield, User as UserIcon } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [role, setRole] = useState("user");
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/me");
      if (res.data.role !== 'admin') {
        router.push("/admin");
        return;
      }
      setUserRole(res.data.role);
    } catch (e) {
      router.push("/login");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users", { username, password, role });
      setShowModal(false);
      setUsername(""); setPassword(""); setRole("user");
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.detail || "사용자 생성 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: number, uname: string) => {
    if (confirm(`사용자 '${uname}'님을 삭제하시겠습니까?`)) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (e: any) {
        alert(e.response?.data?.detail || "사용자 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "admin": return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase border border-red-500/30">관리자</span>;
      case "manager": return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase border border-blue-500/30">매니저</span>;
      default: return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-[10px] font-bold rounded uppercase border border-gray-500/30">사용자</span>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            사용자 관리
          </h1>
          <p className="text-gray-400 mt-1">로그인 가능한 계정 및 권한을 관리하세요.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white hover:bg-gray-100 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          계정 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user: any) => (
          <div key={user.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl relative group overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-gray-300">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.username}</h3>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(user.id, user.username)}
                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#121214] border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              계정 추가
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">아이디 (Username)</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">비밀번호 (Password)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">권한 (Role)</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-3 text-white rounded-xl focus:border-purple-500 outline-none"
                >
                  <option value="admin">관리자 (Admin)</option>
                  <option value="manager">매니저 (Manager)</option>
                  <option value="user">일반 사용자 (User)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">취소</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg transition-all">생성</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
