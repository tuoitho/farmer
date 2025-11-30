import Link from "next/link";
import { Home, Wheat, Briefcase, CloudSun, Bell, CircleUser } from "lucide-react";

interface SidebarProps {
  activePage?: string;
}

export default function Sidebar({ activePage = "home" }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden md:flex bg-[#ebf5ed] border-r border-[#191f19] border-solid box-border flex-col gap-[40px] lg:gap-[50px] h-screen items-center justify-center px-[20px] lg:px-[30px] py-[30px] lg:py-[37px] shrink-0 fixed top-0 left-0 w-[60px] lg:w-[72px] z-40">
        <Link href="/dashboard" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'home' ? 'opacity-100' : 'opacity-50'}`} title="Trang Chủ">
          <Home className="size-[24px] lg:size-[30px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/fields" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'fields' ? 'opacity-100' : 'opacity-50'}`} title="Quản Lí Ruộng">
          <Wheat className="size-[24px] lg:size-[30px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/doctor" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'doctor' ? 'opacity-100' : 'opacity-50'}`} title="Bác Sĩ Cây">
          <Briefcase className="size-[24px] lg:size-[30px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/weather" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'weather' ? 'opacity-100' : 'opacity-50'}`} title="Thời Tiết">
          <CloudSun className="size-[24px] lg:size-[30px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/notifications" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'notifications' ? 'opacity-100' : 'opacity-50'}`} title="Thông Báo">
          <Bell className="size-[24px] lg:size-[30px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/profile" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'profile' ? 'opacity-100' : 'opacity-50'}`} title="Tài Khoản">
          <CircleUser className="size-[24px] lg:size-[30px] text-[#191f19]" />
        </Link>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#ebf5ed] border-t border-[#191f19] border-solid box-border flex gap-[20px] items-center justify-around px-[20px] py-[15px] z-50">
        <Link href="/dashboard" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'home' ? 'opacity-100' : 'opacity-50'}`} title="Trang Chủ">
          <Home className="size-[28px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/fields" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'fields' ? 'opacity-100' : 'opacity-50'}`} title="Quản Lí Ruộng">
          <Wheat className="size-[28px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/doctor" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'doctor' ? 'opacity-100' : 'opacity-50'}`} title="Bác Sĩ Cây">
          <Briefcase className="size-[28px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/weather" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'weather' ? 'opacity-100' : 'opacity-50'}`} title="Thời Tiết">
          <CloudSun className="size-[28px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/notifications" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'notifications' ? 'opacity-100' : 'opacity-50'}`} title="Thông Báo">
          <Bell className="size-[28px] text-[#191f19]" />
        </Link>

        <Link href="/dashboard/profile" className={`relative shrink-0 hover:opacity-70 transition-opacity ${activePage === 'profile' ? 'opacity-100' : 'opacity-50'}`} title="Tài Khoản">
          <CircleUser className="size-[28px] text-[#191f19]" />
        </Link>
      </div>
    </>
  );
}

