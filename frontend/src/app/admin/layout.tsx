"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, LogOut } from "lucide-react";
import { logout } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navs = [
    { name: "월별 기록 목록", href: "/admin", icon: LayoutDashboard },
    { name: "고정 지출 관리", href: "/admin/fixed-expenses", icon: Receipt },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] gap-6 mt-4 md:mt-8">
      <aside className="w-full md:w-64 glass-panel rounded-2xl p-4 flex flex-col h-max shadow-xl border border-white/10">
        <div className="mb-8 px-4 py-2">
          <h2 className="font-extrabold text-2xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">MyCount</h2>
          <p className="text-xs text-gray-400 font-medium tracking-wider uppercase mt-1">관리자 패널</p>
        </div>
        <nav className="flex-1 space-y-2">
          {navs.map((nav) => {
            const isActive = pathname === nav.href;
            const Icon = nav.icon;
            return (
              <Link 
                key={nav.name} 
                href={nav.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                {nav.name}
              </Link>
            )
          })}
        </nav>
        <div className="mt-8 pt-4 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-400 hover:bg-red-500/10 w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>
      <main className="flex-1 glass-panel rounded-2xl p-6 shadow-xl border border-white/10 bg-black/40 overflow-x-hidden relative">
        {children}
      </main>
    </div>
  )
}
