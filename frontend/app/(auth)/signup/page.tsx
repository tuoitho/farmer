"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { actionRegister } from "@/action/auth";
import ProvinceAutocomplete from "@/components/ProvinceAutocomplete";
import { clientAuthUtils } from "@/utils/clientAuth";

const imgImage4 = "https://www.figma.com/api/mcp/asset/bcd561a1-0e13-41f1-9834-eff8b80b7bfc";
const imgImage5 = "https://www.figma.com/api/mcp/asset/dc323571-582f-4fed-bac6-68f4bf53946d";

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!fullName.trim() || !province.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
        setError("Vui lòng điền đầy đủ thông tin");
        return;
      }

      if (password !== confirmPassword) {
        setError("Mật khẩu không khớp");
        return;
      }

      if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }

      // Call register action
      const result = await actionRegister(
        fullName.trim(),
        phone.trim(),
        password,
        confirmPassword,
        province.trim()
      );

      if (result.success) {
        // Token is automatically saved to cookies by server action
        router.push("/dashboard");
      } else {
        setError(result.error || "Đăng ký thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Register error:", err);
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] md:gap-[25px] items-start justify-center relative shrink-0 w-full max-w-[800px] z-10">
        <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
          <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[28px] md:text-[36px] text-black text-center w-full">
            Đăng Kí
          </p>
        </div>
        <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-0 md:px-[40px] lg:px-[80px] py-0 relative shrink-0 w-full">
          <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#191f19] w-full">
              Họ và Tên
            </p>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[50px] md:h-[55px] rounded-[18px] shrink-0 w-full px-4 text-[15px] md:text-[16px]"
              placeholder="Nhập họ và tên"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="box-border flex flex-col gap-[10px] items-start px-0 md:px-[40px] lg:px-[80px] py-0 relative shrink-0 w-full">
          <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#191f19] w-full">
              Tỉnh/Thành Phố
            </p>
            <ProvinceAutocomplete
              value={province}
              onChange={setProvince}
              placeholder="Chọn tỉnh/thành phố"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-0 md:px-[40px] lg:px-[80px] py-0 relative shrink-0 w-full">
          <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#191f19] w-full">
              Số điện thoại
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
          <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
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
        <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-0 md:px-[40px] lg:px-[80px] py-0 relative shrink-0 w-full">
          <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#191f19] w-full">
              Nhập Lại Mật Khẩu
            </p>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[50px] md:h-[55px] rounded-[18px] shrink-0 w-full px-4 text-[15px] md:text-[16px]"
              placeholder="Nhập lại mật khẩu"
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
                {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
              </p>
              {!isLoading && <ArrowRight className="size-[20px] md:size-[24px] text-[#ebf5ed]" />}
            </button>
          </div>
          <div className="box-border flex flex-col gap-[10px] items-start px-0 md:px-[60px] lg:px-[100px] py-0 relative shrink-0 w-full">
            <Link href="/signin" className="bg-[#b5d5b1] border border-[#fffcf6] border-solid box-border flex gap-[15px] md:gap-[20px] h-[60px] md:h-[65px] items-center justify-center px-[20px] md:px-[25px] py-[15px] md:py-[20px] relative rounded-[20px] shrink-0 w-full hover:bg-[#a3c99f] transition-colors">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#191f19] text-center">
                Đã có Tài Khoản? Đăng Nhập Tại đây
              </p>
              <ArrowRight className="size-[20px] md:size-[24px] text-[#191f19]" />
            </Link>
          </div>
        </div>
      </form>

      <div className="hidden lg:flex absolute items-center justify-center right-[80px] xl:right-[100px] top-[261px] -z-10">
        <div className="flex-none rotate-[17.167deg]">
          <div className="h-[118.844px] relative w-[128.639px]">
            <Image alt="" className="absolute inset-0 object-cover pointer-events-none size-full" src={imgImage4} fill />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute items-center justify-center left-[80px] xl:left-[150px] bottom-[100px] -z-10">
        <div className="flex-none rotate-[342.965deg]">
          <div className="h-[243px] relative w-[220px]">
            <Image alt="" className="absolute inset-0 object-cover pointer-events-none size-full" src={imgImage5} fill />
          </div>
        </div>
      </div>
    </div>
  );
}
