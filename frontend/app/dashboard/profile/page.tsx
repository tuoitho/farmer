"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import { CircleUserRound } from "lucide-react";
import Image from "next/image";
import { actionLogout, actionGetProfile, actionUpdateProfile } from "@/action/auth";
import { User } from "@/models/user";
import { toast } from "sonner";

const imgImage10 = "https://www.figma.com/api/mcp/asset/2c86edef-cc3f-4608-951a-cd71a71e873c";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    province: "",
  });

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await actionGetProfile();
        if (result.success && result.data) {
          setUser(result.data);
          setFormData({
            full_name: result.data.full_name,
            province: result.data.province,
          });
        } else {
          toast.error(result.error || "Không thể tải thông tin hồ sơ");
        }
      } catch (error) {
        console.error("Load profile error:", error);
        toast.error("Không thể tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!formData.full_name.trim() || !formData.province.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSaving(true);
    try {
      const result = await actionUpdateProfile(formData);
      if (result.success) {
        toast.success(result.message || "Cập nhật hồ sơ thành công");
        if (result.data) {
          setUser(result.data);
        }
      } else {
        toast.error(result.error || "Cập nhật hồ sơ thất bại");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Cập nhật hồ sơ thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await actionLogout();
      toast.success("Đăng xuất thành công");
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/signin");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#fffcf6] flex items-center justify-center min-h-screen">
        <p className="text-[#2e8623] text-xl">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fffcf6] min-h-screen w-full overflow-x-hidden flex justify-center">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 z-50">
        <Sidebar activePage="profile" />
      </div>

      {/* Main Content - Centered on desktop */}
      <div className="w-full max-w-4xl px-4 sm:px-6 pt-4 md:pt-12 pb-24 md:pb-12 md:ml-[60px] lg:ml-[72px] relative z-0">
        {/* Mobile Spacer - Only shows on mobile */}
        <div className="md:hidden h-16"></div>
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <CircleUserRound className="size-24 sm:size-32 text-[#2e8623]" />
          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-gray-900">Hồ sơ cá nhân</h1>
        </div>

        {/* Form Fields - Centered with max width */}
        <div className="space-y-6 w-full max-w-2xl mx-auto">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">Họ và Tên</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="block w-full rounded-lg border border-[#2e8623] bg-[#ebf5ed] px-4 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-[#2e8623] focus:border-[#2e8623] sm:text-sm transition-colors"
              placeholder="Nhập họ và tên"
            />
          </div>

          {/* Province/City */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">Tỉnh/Thành Phố</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="block w-full rounded-lg border border-[#2e8623] bg-[#ebf5ed] px-4 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-[#2e8623] focus:border-[#2e8623] sm:text-sm transition-colors"
              placeholder="Nhập tỉnh/thành phố"
            />
          </div>

          {/* Phone Number (disabled) */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              value={user?.phone || ""}
              disabled
              className="block w-full rounded-lg border border-[#2e8623] bg-[#ebf5ed]/50 px-4 py-3 text-gray-500 shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>

          {/* Change Password Link */}
          <div className="pt-2">
            <button
              onClick={() => router.push("/dashboard/profile/change-password")}
              className="text-[#2e8623] font-medium hover:underline text-sm sm:text-base transition-colors"
            >
              Đổi mật khẩu →
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#2e8623] hover:bg-[#267019] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2e8623] disabled:opacity-50 transition-colors"
            >
              {saving ? "Đang lưu..." : "Lưu Thông Tin"}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#dc2626] hover:bg-[#b91c1c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Sidebar activePage="profile" />
      </div>

      {/* Decorative Image - Only show on larger screens */}
      <div className="hidden lg:block fixed right-8 bottom-8 -z-10">
        <div className="w-32 h-auto">
          <Image 
            src={imgImage10} 
            alt=""
            width={128}
            height={128}
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
