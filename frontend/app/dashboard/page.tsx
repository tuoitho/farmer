import Sidebar from "./Sidebar";
import Image from "next/image";
import { Tractor, Sprout, Leaf, Sun, Wheat, CircleOff } from "lucide-react";
import farmApi from "@/services/farm";
import { TFarm, CROP_STATUS_LABELS, CropStatus } from "@/models/farm";
import FarmImage from "@/components/FarmImage";
import WeatherAdviceCarousel from "./components/WeatherAdviceCarousel";
import Link from "next/link";
import SearchInput from "./components/SearchInput";

async function getData(
  search?: string,
  startDate?: string,
  endDate?: string,
  cropStatus?: string
): Promise<TFarm[]> {
  try {
    console.log("Fetching farms with params:", {
      search,
      startDate,
      endDate,
      cropStatus,
    });
    const productRes = await farmApi.getFarms(
      search,
      startDate,
      endDate,
      cropStatus
    );
    // Extract farm data from response structure
    const response = productRes as any;
    const farms =
      response?.data?.data || response?.data?.farms || response?.data || [];

    return Array.isArray(farms) ? farms : [];
  } catch (error) {
    console.error("Failed to fetch farm data:", error);
    return [];
  }
}

const imgImage6 =
  "https://www.figma.com/api/mcp/asset/4e070d67-dbbd-4d67-b9d1-50ffc064a606";

// Helper function to get icon based on status
const getStatusIcon = (status: string) => {
  switch (status) {
    case "preparing":
      return <Tractor className="w-full h-full text-[#2e8623]" />;
    case "planted":
      return <Sprout className="w-full h-full text-[#2e8623]" />;
    case "growing":
      return <Leaf className="w-full h-full text-[#2e8623]" />;
    case "flowering":
      return <Sun className="w-full h-full text-yellow-500" />;
    case "harvested":
      return <Wheat className="w-full h-full text-orange-500" />;
    case "fallow":
      return <CircleOff className="w-full h-full text-gray-400" />;
    default:
      return <Sprout className="w-full h-full text-[#2e8623]" />;
  }
};

export default async function Dashboard(props: {
  searchParams: Promise<{
    search?: string;
    start_date?: string;
    end_date?: string;
    crop_status?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search;
  const startDate = searchParams?.start_date;
  const endDate = searchParams?.end_date;
  const cropStatus = searchParams?.crop_status;

  const data = await getData(search, startDate, endDate, cropStatus);

  return (
    <div className="bg-[#fffcf6] flex flex-col md:flex-row items-start relative min-h-screen w-full overflow-hidden">
      <Sidebar activePage="home" />

      <div className="flex flex-[1_0_0] flex-col gap-[25px] md:gap-[35px] items-center min-h-screen w-full max-w-full relative pb-20 md:pb-8 md:ml-[60px] lg:ml-[72px] overflow-x-hidden">
        <div className="flex flex-col gap-[18px] items-start justify-center relative shrink-0 w-full max-w-full">
          <div className="box-border flex flex-col gap-[18px] md:gap-[22px] items-center justify-center px-[20px] md:px-[40px] lg:px-[50px] py-0 relative shrink-0 w-full max-w-full pt-6 md:pt-8">
            <div className="bg-transparent h-[30px] md:h-[40px] shrink-0 w-full" />
            <div className="capitalize font-['Montserrat'] font-semibold leading-[1.3] relative shrink-0 text-[22px] md:text-[28px] lg:text-[32px] text-black text-center w-full">
              <p className="mb-0">Chào A,</p>
              <p>Bạn Cần Gì? Hãy Nói Cho Tôi Biết</p>
            </div>
            <SearchInput />
          </div>
        </div>

        <div className="box-border flex flex-col gap-[10px] items-start px-[20px] md:px-[40px] lg:px-[50px] py-0 relative shrink-0 w-full max-w-full">
          {data.length > 0 ? (
            <WeatherAdviceCarousel farms={data} />
          ) : (
            <div className="bg-[#ebf5ed] p-4 rounded-[18px] w-full text-center">
              Chưa có ruộng nào để dự báo thời tiết.
            </div>
          )}
        </div>

        <div className="box-border flex flex-col gap-[15px] md:gap-[18px] items-start justify-center px-[20px] md:px-[40px] lg:px-[50px] py-0 relative shrink-0 w-full max-w-full">
          <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[22px] md:text-[26px] text-black text-center w-full z-10">
            Ruộng Của Bạn
          </p>
          <div className="flex gap-[12px] md:gap-[16px] items-start relative shrink-0 w-full overflow-x-auto pb-4 z-10 scrollbar-hide">
            {data?.length > 0 ? (
              data.map((farm: TFarm) => (
                <Link
                  key={farm.id || farm.name}
                  href={`/dashboard/fields/${farm.id}`}
                  className="block shrink-0"
                >
                  <div className="bg-[#fffcf6] border-2 border-[#2e8623] border-solid relative rounded-[14.09px] shrink-0 w-[220px] md:w-[250px] hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="box-border flex flex-col gap-[12px] md:gap-[15px] items-center overflow-clip pb-[20px] md:pb-[24px] pt-[12px] md:pt-[15px] px-[12px] md:px-[15px] relative rounded-[inherit]">
                      <div className="relative h-[110px] md:h-[130px] shrink-0 w-full rounded-[8px] overflow-hidden">
                        <FarmImage alt={farm.name} src={(farm as any).image} />
                      </div>
                      <div className="flex flex-col gap-[4px] md:gap-[5px] items-start leading-[normal] relative shrink-0 text-black w-full pr-[60px]">
                        <p className="font-['Be_Vietnam_Pro'] font-semibold relative shrink-0 text-[18px] md:text-[20px] w-full truncate">
                          {farm.name || "N/A"}
                        </p>
                        <p className="font-['Be_Vietnam_Pro'] relative shrink-0 text-[13px] md:text-[14px] w-full">
                          Ngày trồng:{" "}
                          {farm.planting_date
                            ? new Date(farm.planting_date).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </p>
                        <p className="font-['Be_Vietnam_Pro'] relative shrink-0 text-[13px] md:text-[14px] w-full">
                          Tình Trạng:{" "}
                          {CROP_STATUS_LABELS[farm.crop_status as CropStatus] ||
                            farm.crop_status ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="absolute h-[50px] md:h-[60px] right-[10px] bottom-[15px] w-[50px] md:w-[60px] opacity-80">
                        {getStatusIcon(farm.crop_status)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 w-full py-8">
                Không có dữ liệu ruộng
              </p>
            )}
          </div>
        </div>

        <div className="box-border flex flex-col gap-[15px] md:gap-[18px] items-center justify-center px-[20px] md:px-[40px] py-0 relative shrink-0 w-full max-w-full pb-6 md:pb-8">
          <p className="capitalize font-['Montserrat'] font-semibold leading-[1.3] relative shrink-0 text-[20px] md:text-[24px] text-black text-center w-full max-w-[600px] z-10">
            Cây bạn có vấn đề Gì À?
          </p>
          <Link href={`/dashboard/doctor`}>
            <button className="bg-[#2e8623] border border-[#fffcf6] border-solid box-border flex gap-[15px] items-center justify-center px-[20px] md:px-[25px] py-[14px] md:py-[16px] relative rounded-[20px] shrink-0 w-full max-w-[500px] hover:bg-[#267019] transition-colors z-10">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[15px] md:text-[17px] text-[#ebf5ed]">
                Bác sĩ Cây
              </p>

              <div className="overflow-clip relative shrink-0 size-[20px] md:size-[24px]">
                <div className="relative size-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#ebf5ed]"
                  >
                    <path d="M12 6v4" />
                    <path d="M14 14h-4" />
                    <path d="M14 18h-4" />
                    <path d="M14 8h-4" />
                    <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
                    <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
                  </svg>
                </div>
              </div>
            </button>
          </Link>

          <div className="hidden lg:flex absolute items-center justify-center right-[50px] bottom-[80px] -z-10">
            <div className="flex-none rotate-[343.705deg]">
              <div className="h-[180px] opacity-60 relative w-[270px]">
                <Image
                  alt=""
                  className="absolute inset-0 object-cover pointer-events-none size-full"
                  src={imgImage6}
                  fill
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
