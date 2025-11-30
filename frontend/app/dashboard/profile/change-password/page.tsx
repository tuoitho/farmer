"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Sidebar from "../../Sidebar";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { actionChangePassword } from "@/action/auth";
import { toast } from "sonner";

const imgImage10 = "https://www.figma.com/api/mcp/asset/2c86edef-cc3f-4608-951a-cd71a71e873c";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.current_password || !formData.new_password || !formData.confirm_new_password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.new_password !== formData.confirm_new_password) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    setLoading(true);
    try {
      const result = await actionChangePassword(formData);
      if (result.success) {
        toast.success(result.message || "Đổi mật khẩu thành công");
        setFormData({
          current_password: "",
          new_password: "",
          confirm_new_password: "",
        });
        setTimeout(() => {
          router.push("/dashboard/profile");
        }, 1500);
      } else {
        toast.error(result.error || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fffcf6] flex flex-col md:flex-row items-start relative min-h-screen w-full overflow-hidden">
      <Sidebar activePage="profile" />

      <div className="box-border flex flex-[1_0_0] flex-col gap-[15px] md:gap-[18px] h-full items-center min-h-px min-w-px overflow-y-auto pb-[30px] pt-[40px] md:pt-[50px] px-[20px] md:px-[40px] relative shrink-0 w-full md:ml-[60px] lg:ml-[72px]">
        {/* Back Button */}
        <div className="flex w-full px-[40px] md:px-[120px] lg:px-[160px]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#2e8623] font-['Be_Vietnam_Pro'] font-semibold text-[16px] md:text-[18px] hover:underline"
          >
            <ArrowLeft className="size-5" />
            Quay lại
          </button>
        </div>

        {/* Title */}
        <div className="flex gap-[20px] items-center justify-center relative shrink-0 pt-4">
          <h1 className="font-['Montserrat'] font-bold text-[28px] md:text-[36px] text-[#2e8623]">
            Đổi Mật Khẩu
          </h1>
        </div>

        <div className="h-[15px] md:h-[18px] shrink-0" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] md:gap-[25px] items-start justify-center relative shrink-0 w-full">
          <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[40px] md:px-[120px] lg:px-[160px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Mật khẩu hiện tại
              </p>
              <input
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
          </div>

          <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[40px] md:px-[120px] lg:px-[160px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Mật khẩu mới
              </p>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
              />
            </div>
          </div>

          <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[40px] md:px-[120px] lg:px-[160px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Xác nhận mật khẩu mới
              </p>
              <input
                type="password"
                value={formData.confirm_new_password}
                onChange={(e) => setFormData({ ...formData, confirm_new_password: e.target.value })}
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="box-border flex flex-col gap-[10px] items-start pb-0 pt-[16px] px-0 relative shrink-0 w-full">
            <div className="box-border flex flex-col gap-[10px] items-start px-[100px] md:px-[300px] py-0 relative shrink-0 w-full">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#2e8623] border border-[#fffcf6] border-solid box-border flex gap-[15px] md:gap-[20px] h-[60px] md:h-[71px] items-center justify-center px-[20px] md:px-[25px] py-[16px] md:py-[20px] relative rounded-[20px] shrink-0 w-full hover:bg-[#267019] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[17px] md:text-[20px] text-[#ebf5ed]">
                  {loading ? "Đang xử lý..." : "Đổi Mật Khẩu"}
                </p>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Decorative Image */}
      <div className="hidden lg:flex absolute items-center justify-center right-[100px] bottom-[50px] -z-10">
        <div className="flex-none rotate-[350.359deg]">
          <div className="h-[120.156px] relative w-[145.332px]">
            <Image alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage10} width={145} height={120} />
          </div>
        </div>
      </div>
    </div>
  );
}
