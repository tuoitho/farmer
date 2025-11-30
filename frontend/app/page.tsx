import Link from "next/link";
import Image from "next/image";
import { Lightbulb, CloudSun, Wheat, ArrowRight, Bot } from "lucide-react";

const imgFrame1 = "/296bef19cb72422c693f0a0ae79500868f901c3d.png";
const imgImage2 = "https://www.figma.com/api/mcp/asset/66b72902-d042-41db-9be7-2564c0ff36c4";
const imgImage3 = "https://www.figma.com/api/mcp/asset/173d0f03-edb9-4730-881d-c344ac8f7e53";

export default function Home() {
  return (
    <div className="bg-[#fffcf6] box-border flex flex-col gap-[60px] md:gap-[80px] lg:gap-[100px] items-center pb-[60px] md:pb-[80px] lg:pb-[100px] pt-[70px] md:pt-[100px] lg:pt-[130px] px-[20px] md:px-[60px] lg:px-[150px] relative min-h-screen w-full">
      {/* Fixed Header */}
      <div className="fixed bg-[#ebf5ed] border-b border-[#191f19] border-solid box-border capitalize flex font-['Be_Vietnam_Pro'] font-black gap-[20px] md:gap-[40px] lg:gap-[50px] h-[55px] md:h-[60px] items-center justify-end leading-[normal] left-0 px-[20px] md:px-[80px] lg:px-[161px] py-[12px] md:py-[15px] text-[15px] md:text-[16px] text-[#191f19] top-0 w-full z-50">
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

      {/* Hero Banner - Higher Position */}
      <div className="box-border flex flex-col md:flex-row gap-4 md:gap-6 h-auto min-h-[350px] md:h-[500px] lg:h-[600px] items-start md:items-end justify-end p-6 md:py-16 md:px-8 lg:px-16 xl:px-32 relative rounded-[18px] w-full mt-4 md:mt-0">
        <Image 
          alt="Nông nghiệp 4.0" 
          className="absolute inset-0 object-cover pointer-events-none rounded-[18px] w-full h-full" style={{ objectPosition: 'center' }}
          src={imgFrame1} 
          fill 
          priority 
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute bg-gradient-to-b from-[rgba(25,31,25,0.2)] to-[#191f19] inset-0 rounded-[18px] -z-10" />
        
        <div className="w-full md:flex-1 space-y-2 md:space-y-3 z-10 max-w-4xl">
          <h1 className="font-['Montserrat'] font-black not-italic leading-tight tracking-normal text-3xl xs:text-4xl sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-[64px] text-[#ebf5ed] mb-4 md:mb-6 capitalize">
            <p className="mb-0">Nông nghiệp 4.0:</p>
            <p className="mb-0">Cây trong tầm tay -</p>
            <p>Mùa màng bội thu.</p>
          </h1>
        </div>
        
        <div className="w-full md:w-auto z-10">
          <Link 
            href="/signin" 
            className="inline-flex items-center justify-center gap-2 md:gap-4 px-4 py-3 md:px-6 md:py-4 bg-[#d68b00] border border-[#fffcf6] rounded-xl md:rounded-2xl hover:bg-[#c07d00] transition-colors w-full md:w-auto"
          >
            <span className="capitalize font-['Be_Vietnam_Pro'] font-semibold text-sm sm:text-base md:text-lg text-[#ebf5ed] whitespace-nowrap">
              Bắt Đầu Ngay
            </span>
            <ArrowRight className="size-5 md:size-6 text-[#ebf5ed] flex-shrink-0" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-[30px] items-start justify-center relative shrink-0 w-full">
        <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[28px] md:text-[36px] text-black text-center w-full">
          Giải Pháp Toàn Diện Cho Nông Nghiệp
        </p>
        <div className="gap-[10px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto overflow-clip relative shrink-0 w-full">
          <div className="bg-[#ebf5ed] box-border flex flex-col gap-[10px] items-start overflow-clip p-[25px] relative rounded-[18px] shrink-0 min-h-[250px]">
            <div className="bg-[#2e8623] box-border flex items-center justify-center p-[15px] relative rounded-[50px] shrink-0">
              <Wheat className="size-[20px] text-[#fffcf6]" />
            </div>
            <div className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative text-[20px] md:text-[22px] text-black">
              <p className="mb-0">{`Quản Lí `}</p>
              <p>Cánh Đồng</p>
            </div>
            <p className="font-['Be_Vietnam_Pro'] leading-[1.5] relative text-[14px] md:text-[15px] text-black">
              Dễ dàng thêm, sửa, xóa thông tin chi tiết của từng lô đất, từng loại cây trồng, mọi thứ trong một nơi.
            </p>
          </div>

          <div className="bg-[#2e8623] box-border flex flex-col gap-[10px] items-start overflow-clip p-[25px] relative rounded-[18px] shrink-0 min-h-[250px]">
            <div className="bg-[#ebf5ed] box-border flex items-center justify-center p-[15px] relative rounded-[50px] shrink-0">
              <Bot className="size-[20px] text-[#191f19]" />
            </div>
            <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative text-[20px] md:text-[22px] text-[#fffcf6]">{`Bác Sĩ Cây - AI`}</p>
            <p className="font-['Be_Vietnam_Pro'] leading-[1.5] relative text-[14px] md:text-[15px] text-[#fffcf6]">
              Chỉ cần Tải lên ảnh cây trồng, hệ thống AI sẽ chẩn đoán chính xác loại bệnh, sâu hại và đưa ra khuyến nghị điều trị chi tiết ngay lập tức.
            </p>
          </div>

          <div className="bg-[#ebf5ed] box-border flex flex-col gap-[10px] items-start overflow-clip p-[25px] relative rounded-[18px] shrink-0 min-h-[250px]">
            <div className="bg-[#2e8623] box-border flex items-center justify-center p-[15px] relative rounded-[50px] shrink-0">
              <CloudSun className="size-[20px] text-[#fffcf6]" />
            </div>
            <div className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative text-[20px] md:text-[22px] text-black">
              <p className="mb-0">{`Cảnh Báo `}</p>
              <p>Thời Tiết Sớm</p>
            </div>
            <p className="font-['Be_Vietnam_Pro'] leading-[1.5] relative text-[14px] md:text-[15px] text-black">
              Dễ dàng thêm, sửa, xóa thông tin chi tiết của từng lô đất, từng loại cây trồng, mọi thứ trong một nơi.
            </p>
          </div>

          <div className="bg-[#ebf5ed] box-border flex flex-col gap-[10px] items-start overflow-clip p-[25px] relative rounded-[18px] shrink-0 min-h-[250px]">
            <div className="bg-[#2e8623] box-border flex items-center justify-center p-[15px] relative rounded-[50px] shrink-0">
              <Lightbulb className="size-[20px] text-[#fffcf6]" />
            </div>
            <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative text-[20px] md:text-[22px] text-black">
              Nhiều Tính Năng Sắp ra Mắt
            </p>
            <p className="font-['Be_Vietnam_Pro'] leading-[1.5] relative text-[14px] md:text-[15px] text-black">
              Chúng tôi không ngừng nâng cấp để mang lại trải nghiệm nông nghiệp 4.0 tốt nhất cho bạn
            </p>
          </div>
        </div>
      </div>

      <div className="box-border flex flex-col gap-[30px] items-start justify-center px-[20px] md:px-[40px] py-0 relative shrink-0 w-full">
        <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[28px] md:text-[36px] text-black text-center w-full">
          Về Chúng Tôi
        </p>
        <div className="bg-[#d9d9d9] h-[180px] md:h-[220px] shrink-0 w-full rounded-[18px]" />
        <div className="font-['Be_Vietnam_Pro'] font-semibold leading-[1.6] relative shrink-0 text-[18px] md:text-[22px] text-black text-center w-full">
          <p className="mb-0">Ctrl+Alt+Win! Khởi động lại nền nông nghiệp Việt Nam qua ---, giải pháp tiên tiến cho người nông dân. Cùng chúng tôi chiến đấu trong cuộc thi Naver nhé!</p>
          <p>P/S: Vào chung Kết thì đổi ảnh team!!</p>
        </div>
      </div>

      <div className="box-border flex flex-col gap-[30px] items-center justify-center px-[20px] md:px-[40px] py-0 relative shrink-0 w-full">
        <p className="capitalize font-[Montserrat'] font-semibold leading-[1.3] relative shrink-0 text-[28px] md:text-[36px] text-black text-center max-w-[800px] z-10">
          Bắt Đầu Quản Lí Ruộng của bạn Thôi!
        </p>
        <Link href="/signin" className="bg-[#2e8623] border border-[#fffcf6] border-solid box-border flex gap-[15px] md:gap-[20px] items-center justify-center px-[25px] md:px-[35px] py-[15px] md:py-[20px] relative rounded-[20px] shrink-0 w-full max-w-[600px] hover:bg-[#267019] transition-colors z-10">
          <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#ebf5ed]">
            Bắt Đầu Ngay
          </p>
          <ArrowRight className="size-[20px] md:size-[24px] text-[#ebf5ed]" />
        </Link>
        <div className="hidden lg:block absolute h-[234px] right-[50px] top-[-736px] w-[205px] -z-10">
          <Image alt="" className="absolute inset-0 object-cover pointer-events-none size-full" src={imgImage2} fill />
        </div>
        <div className="hidden lg:flex absolute h-[343px] items-center justify-center left-[50px] top-[-80px] w-[242px] -z-10">
          <div className="flex-none rotate-[318.684deg]">
            <div className="h-[343.001px] relative w-[241.815px]">
              <Image alt="" className="absolute inset-0 object-cover pointer-events-none size-full" src={imgImage3} fill />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
