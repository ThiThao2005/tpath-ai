"use client"
import toast from "react-hot-toast";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, Target, Map, Lightbulb, 
  LayoutGrid, FolderOpen, User, Sparkles, LogOut 
} from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();


 const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast.success("Đã đăng xuất thành công!");
      setUser(null); // Cập nhật state để UI đổi ngay lập tức
      router.push("/"); // Đưa về trang chủ nếu đang ở trang bảo mật
    } else {
      toast.error("Lỗi khi đăng xuất: " + error.message);
    }
  };

  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      // 2. Thay alert bằng toast.error
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này!", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      router.push("/login");
    }
  };
useEffect(() => {
    // 1. Lấy user hiện tại khi vừa load trang
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // 2. Lắng nghe sự thay đổi trạng thái đăng nhập
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe(); // Dọn dẹp listener khi component unmount
  }, []);



  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col font-sans">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter cursor-default">
            ITPath AI
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-xs text-slate-500">Xin chào, {user.email?.split('@')[0]}</span>
                <button 
                  onClick={handleLogout}
                  className="group flex items-center gap-2 text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Đăng nhập</Link>
                <Link href="/register" className="text-sm font-bold bg-white text-slate-950 px-6 py-2 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-95">
                  Tham gia ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HIỆU ỨNG NỀN */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      {/* --- NỘI DUNG CHÍNH --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-32 pb-20 px-6">
        
        {/* --- TẦNG 1: CÁC NÚT CHỨC NĂNG CHÍNH (Kiểm tra đăng nhập) --- */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <MainActionCard 
            href="/quiz" 
            title="Skill Quiz" 
            desc="Đánh giá năng lực IT thực tế" 
            icon={<Target className="text-orange-400" size={32} />} 
            color="hover:border-orange-500/50"
            onClick={(e: any) => handleProtectedClick(e, "/quiz")}
          />
          <MainActionCard 
            href="/roadmap" 
            title="AI Roadmap" 
            desc="Lộ trình học tập cá nhân hóa" 
            icon={<Map className="text-cyan-400" size={32} />} 
            color="hover:border-cyan-500/50"
            onClick={(e: any) => handleProtectedClick(e, "/roadmap")}
          />
          <MainActionCard 
            href="/projects" 
            title="AI Projects" 
            desc="Gợi ý ý tưởng dự án thực tế" 
            icon={<Lightbulb className="text-yellow-400" size={32} />} 
            color="hover:border-yellow-500/50"
            onClick={(e: any) => handleProtectedClick(e, "/projects")}
          />
        </div>

        {/* --- TẦNG 2: NỘI DUNG GIỚI THIỆU --- */}
        <div className="text-center max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> AI-Powered Career Assistant
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            Xác định vị trí <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Vươn tầm quốc tế
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto italic">
            "Hành trình vạn dặm luôn bắt đầu bằng một bước chân đúng hướng."
          </p>
        </div>

        {/* --- TẦNG 3: CÁC TÍNH NĂNG CHỈ HIỆN KHI ĐÃ ĐĂNG NHẬP --- */}
        {user && (
          <div className="flex flex-wrap justify-center gap-4 mt-16 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SmallLink href="/dashboard" icon={<LayoutGrid size={16}/>} text="Dashboard" />
            <SmallLink href="/portfolio" icon={<FolderOpen size={16}/>} text="My Portfolio" />
            <SmallLink href="/u/thao" icon={<User size={16}/>} text="Public Profile" />
          </div>
        )}
      </main>

      <footer className="relative z-10 py-8 text-center text-slate-600 text-xs border-t border-white/5 mx-10">
        © 2024 ITPath AI - Trợ lý lộ trình IT thông minh
      </footer>
    </div>
  );
}

// --- COMPONENT CON ---
function MainActionCard({ href, title, desc, icon, color, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`group p-8 bg-slate-900/40 border border-white/5 rounded-[2rem] transition-all duration-300 hover:-translate-y-2 ${color} hover:bg-slate-900/60 shadow-2xl active:scale-95`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        {title} <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </Link>
  );
}

function SmallLink({ href, icon, text }: any) {
  return (
    <Link href={href} className="flex items-center gap-2 px-6 py-3 bg-slate-900/80 border border-white/5 rounded-2xl hover:border-blue-500/30 hover:bg-slate-800 transition-all text-sm text-slate-400 hover:text-white shadow-lg">
      {icon} {text}
    </Link>
  );
}