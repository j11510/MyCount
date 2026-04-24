"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, LogOut, Users, Shield, Settings, BookOpen, BarChart3, Heart, Baby, FileText } from "lucide-react";
import { logout } from "@/lib/api";
import api from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/me");
      console.log("Current user role:", res.data.role);
      setRole(res.data.role);
    } catch (e) {
      console.error("Failed to fetch user:", e);
      window.location.href = "/login";
    }
  };

  const getPanelName = (r: string | null) => {
    switch(r) {
      case "admin": return "관리자 패널";
      case "manager": return "매니저 패널";
      case "user": return "유저 패널";
      default: return "패널";
    }
  };

  const generalNavs = [
    { name: "월별 기록 목록", href: "/admin", icon: LayoutDashboard, alwaysVisible: true },
    { name: "고정 지출 관리", href: "/admin/fixed-expenses", icon: Receipt, alwaysVisible: true },
    { name: "사용자 관리", href: "/admin/users", icon: Users, role: "admin" }
  ].filter(n => n.alwaysVisible || n.role === role);

  const accountingNavs = [
    { name: "회계 카테고리", href: "/admin/accounting/categories", icon: Settings },
    { name: "회계 장부 관리", href: "/admin/accounting/transactions", icon: BookOpen },
    { name: "회계 통계", href: "/admin/accounting/stats", icon: BarChart3 },
    { name: "헌금 관리", href: "/admin/donations", icon: Heart },
    { name: "영아부 지출 관리", href: "/admin/infant-expenses", icon: Baby },
    { name: "영아부 월별 보고", href: "/admin/monthly-reports", icon: FileText }
  ].filter(() => role === "admin" || role === "manager");

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] gap-6 mt-4 md:mt-8">
      <aside className="w-full md:w-64 glass-panel rounded-2xl p-4 flex flex-col h-max shadow-xl border border-white/10">
        <div className="mb-8 px-4 py-2">
          <h2 className="font-extrabold text-2xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">MyCount</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">{getPanelName(role)}</p>
            {role && (
              <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-purple-300 font-bold border border-white/5">
                {role}
              </span>
            )}
          </div>
        </div>
        
        <nav className="flex-1 space-y-6">
          {/* General Management Section */}
          {generalNavs.length > 0 && (
            <div>
              <p className="px-4 mb-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">기본 관리</p>
              <div className="space-y-1">
                {generalNavs.map((nav) => {
                  const isActive = pathname === nav.href;
                  const Icon = nav.icon;
                  return (
                    <Link 
                      key={nav.name} 
                      href={nav.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${isActive ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {nav.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Separator */}
          {generalNavs.length > 0 && accountingNavs.length > 0 && (
            <div className="mx-4 border-t border-white/5" />
          )}

          {/* Accounting Section */}
          {accountingNavs.length > 0 && (
            <div>
              <p className="px-4 mb-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">장부/회계 시스템</p>
              <div className="space-y-1">
                {accountingNavs.map((nav) => {
                  const isActive = pathname === nav.href;
                  const Icon = nav.icon;
                  return (
                    <Link 
                      key={nav.name} 
                      href={nav.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${isActive ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {nav.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
          {role !== null && role !== "admin" && (
            <p className="text-center text-xs text-gray-500 mt-10 p-4 border border-white/5 bg-white/5 rounded-xl">
              권한이 제한된 상태입니다.<br/>관리자에게 문의하세요.
            </p>
          )}
        </nav>
        <div className="mt-8 pt-4 border-t border-white/10">
          <button 
            onClick={() => {
              if (confirm("로그아웃 하시겠습니까?")) {
                logout();
              }
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-400 hover:bg-red-500/10 w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>
      <main className="flex-1 glass-panel rounded-2xl p-6 shadow-xl border border-white/10 bg-black/40 overflow-x-hidden relative">
        {(role === "admin" || (role === "manager" && (pathname.startsWith("/admin/accounting") || pathname.startsWith("/admin/donations") || pathname.startsWith("/admin/infant-expenses") || pathname.startsWith("/admin/monthly-reports")))) ? (
          children
        ) : role !== null ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <Shield className="w-16 h-16 text-red-500/50 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">접근 권한 없음</h2>
            <p className="text-gray-400">
              이 페이지는 관리자만 접근할 수 있습니다.<br/>
              현재 권한: <span className="text-purple-400 font-bold">{role}</span>
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}
      </main>
    </div>
  )
}
