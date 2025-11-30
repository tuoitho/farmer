"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { actionLogin } from "@/action/auth";
import { clientAuthUtils } from "@/utils/clientAuth";


const imgImage4 = "https://www.figma.com/api/mcp/asset/06b03577-8601-4e95-a6c7-632f4aa86cf7";
const imgImage5 = "https://www.figma.com/api/mcp/asset/e44936b8-7287-4b14-b39d-2bc63a299ecf";

export default function SignIn() {
  const router = useRouter();
  const [phone, setPhone] = useState("0123456789");
  const [password, setPassword] = useState("123456aA@");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!phone.trim() || !password.trim()) {
        setError("Vui lòng nhập số điện thoại và mật khẩu");
        return;
      }

      // Call login action
      const result = await actionLogin(phone.trim(), password);
      
      if (result.success) {
        // Token is automatically saved to cookies by server action
        router.push("/dashboard");
      } else {
        setError(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fffcf6] box-border flex flex-col gap-[60px] md:gap-[80px] lg:gap-[100px] items-center pb-[60px] md:pb-[80px] lg:pb-[100px] pt-[80px] md:pt-[120px] lg:pt-[158px] px-[20px] md:px-[60px] lg:px-[150px] relative min-h-screen w-full">
      {/* Fixed Header */}
      <div className="fixed bg-[#ebf5ed] border-b border-[#191f19] border-solid box-border capitalize flex font-['Be_Vietnam_Pro'] font-black gap-[20px] md:gap-[40px] lg:gap-[50px] h-[70px] md:h-[80px] items-center justify-end leading-[normal] left-0 px-[20px] md:px-[80px] lg:px-[161px] py-[15px] md:py-[25px] text-[16px] md:text-[18px] text-[#191f19] top-0 w-full z-50">
        <Link href="/" className="relative shrink-0 hover:text-[#2e8623] transition-colors">
          Trang Chủ
        </Link>
        <Link href="/signin" className="relative shrink-0 hover:text-[#2e8623] transition-colors">
          Đăng Nhập
        </Link>
        <Link href="/signup" className="relative shrink-0 hover:text-[#2e8623] transition-colors">
          Đăng Kí
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[30px] items-start justify-center relative shrink-0 w-full max-w-[800px] z-10">
        <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
          <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[28px] md:text-[36px] text-black text-center w-full">
            Đăng Nhập
          </p>
        </div>
        <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-0 md:px-[40px] lg:px-[80px] py-0 relative shrink-0 w-full">
          <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
            <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#191f19] w-full">
              Số Điện Thoại
            </p>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[50px] md:h-[55px] rounded-[18px] shrink-0 w-full px-4 text-[15px] md:text-[16px]"
              placeholder="Nhập số điện thoại"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-0 md:px-[40px] lg:px-[80px] py-0 relative shrink-0 w-full">
          <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
            <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#191f19] w-full">
              Mật Khẩu
            </p>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[50px] md:h-[55px] rounded-[18px] shrink-0 w-full px-4 text-[15px] md:text-[16px]"
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-0 md:px-[40px] lg:px-[80px] py-0 relative shrink-0 w-full">
            <div className="bg-red-50 border border-red-200 rounded-[12px] p-3 w-full">
              <p className="text-red-600 text-[14px] text-center">{error}</p>
            </div>
          </div>
        )}
        
        <div className="box-border flex flex-col gap-[10px] items-start pb-0 pt-[16px] px-0 relative shrink-0 w-full">
          <div className="box-border flex flex-col gap-[10px] items-start px-0 md:px-[60px] lg:px-[100px] py-0 relative shrink-0 w-full">
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#2e8623] border border-[#fffcf6] border-solid box-border flex gap-[15px] md:gap-[20px] h-[60px] md:h-[65px] items-center justify-center px-[20px] md:px-[25px] py-[15px] md:py-[20px] relative rounded-[20px] shrink-0 w-full hover:bg-[#267019] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#ebf5ed]">
                {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </p>
              {!isLoading && <ArrowRight className="size-[20px] md:size-[24px] text-[#ebf5ed]" />}
            </button>
          </div>
          <div className="box-border flex flex-col gap-[10px] items-start px-0 md:px-[60px] lg:px-[100px] py-0 relative shrink-0 w-full">
            <Link href="/signup" className="bg-[#b5d5b1] border border-[#fffcf6] border-solid box-border flex gap-[15px] md:gap-[20px] h-[60px] md:h-[65px] items-center justify-center px-[20px] md:px-[25px] py-[15px] md:py-[20px] relative rounded-[20px] shrink-0 w-full hover:bg-[#a3c99f] transition-colors">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#191f19] text-center">
                Chưa có Tài Khoản? Đăng Kí ngay
              </p>
              <ArrowRight className="size-[20px] md:size-[24px] text-[#191f19]" />
            </Link>
          </div>
        </div>
      </form>

      <div className="hidden lg:flex absolute items-center justify-center right-[100px] xl:right-[150px] top-[179px] -z-10">
        <div className="flex-none rotate-[17.167deg]">
          <div className="h-[118.844px] relative w-[128.639px]">
            <Image alt="" className="absolute inset-0 object-cover pointer-events-none size-full" src={imgImage4} fill />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute items-center justify-center left-[100px] xl:left-[149px] top-[393px] -z-10">
        <div className="flex-none rotate-[342.965deg]">
          <div className="h-[243px] relative w-[220px]">
            <Image alt="" className="absolute inset-0 object-cover pointer-events-none size-full" src={imgImage5} fill />
          </div>
        </div>
      </div>
    </div>
  );
}
