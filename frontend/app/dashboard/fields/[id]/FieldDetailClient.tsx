'use client';

import Sidebar from "../../Sidebar";
import { useState, useMemo } from 'react';
import { Camera, SquarePen, MapPin, Calendar } from "lucide-react";
import { TFarm, CROP_STATUS_LABELS } from "@/models/farm";
import DiseaseDetectionModal from './components/DiseaseDetectionModal';
import CropStatusSelector from './components/CropStatusSelector';

interface FieldDetailClientProps {
  farm: TFarm | null;
}

export default function FieldDetailClient({ farm }: FieldDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFarm, setCurrentFarm] = useState<TFarm | null>(farm);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleStatusUpdated = (newStatus: string) => {
    if (currentFarm) {
      setCurrentFarm({
        ...currentFarm,
        crop_status: newStatus
      });
    }
  };

  // Tính toán tiến độ và số ngày còn lại
  const cropProgress = useMemo(() => {
    if (!currentFarm?.planting_date || !currentFarm?.expected_harvest_date) {
      return { percentage: 0, daysRemaining: 0, totalDays: 0 };
    }

    const plantingDate = new Date(currentFarm.planting_date);
    const harvestDate = new Date(currentFarm.expected_harvest_date);
    const today = new Date();

    const totalDays = Math.ceil((harvestDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const percentage = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);

    return { percentage, daysRemaining, totalDays };
  }, [currentFarm]);

  if (!currentFarm) {
    return (
      <div className="bg-[#fffcf6] flex flex-col md:flex-row items-start relative min-h-screen w-full overflow-hidden">
        <Sidebar activePage="fields" />
        <div className="flex flex-[1_0_0] items-center justify-center min-h-screen">
          <p className="text-xl text-red-500">Không tìm thấy thông tin ruộng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fffcf6] flex flex-col md:flex-row items-start relative min-h-screen w-full overflow-hidden">
      <Sidebar activePage="fields" />

      <div className="box-border flex flex-[1_0_0] flex-col gap-[30px] md:gap-[40px] h-full items-center min-h-px min-w-px overflow-y-auto px-[20px] md:px-[40px] py-0 relative shrink-0 w-full pb-20 md:pb-8 md:ml-[60px] lg:ml-[72px]">
        <div className="box-border flex flex-col gap-[18px] md:gap-[22px] items-center px-[20px] md:px-[60px] py-0 relative shrink-0 w-full">
          <div className="bg-transparent h-[30px] md:h-[40px] shrink-0 w-full" />
        </div>

        {/* Title and Edit Button */}
        <div className="flex flex-col gap-[12px] md:gap-[14px] items-center relative shrink-0 w-full">
          <div className="flex gap-[20px] md:gap-[30px] items-center justify-center relative shrink-0 w-full">
            <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[36px] md:text-[48px] text-black text-center">
              {currentFarm.name || 'Ruộng Lúa'}
            </p>
            <button className="bg-[#2e8623] box-border flex flex-col gap-[10px] items-start justify-center overflow-clip p-[12px] md:p-[15px] relative rounded-[50px] shrink-0 hover:bg-[#267019] transition-colors">
              <SquarePen className="size-[16px] md:size-[18.996px] text-[#fffcf6]" />
            </button>
          </div>

          {/* Progress Bar with Days Info */}
          <div className="flex flex-col gap-2 relative shrink-0 w-full max-w-[1138px]">
            <div className="relative w-full">
              <div className="bg-[#d9d9d9] h-[12px] w-full rounded-full" />
              <div
                className="bg-[#2e8623] h-[12px] rounded-full absolute top-0 left-0 transition-all duration-300"
                style={{ width: `${cropProgress.percentage}%` }}
              />
            </div>
            {cropProgress.daysRemaining > 0 ? (
              <div className="flex items-center justify-between text-sm text-gray-600 px-2">
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  Còn {cropProgress.daysRemaining} ngày đến thu hoạch
                </span>
                <span>{Math.round(cropProgress.percentage)}%</span>
              </div>
            ) : cropProgress.daysRemaining < 0 ? (
              <p className="text-sm text-orange-600 text-center">Đã quá hạn thu hoạch {Math.abs(cropProgress.daysRemaining)} ngày</p>
            ) : (
              <p className="text-sm text-green-600 text-center font-semibold">Đến ngày thu hoạch!</p>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[1138px]">
          <div className="bg-white border-2 border-[#2e8623] rounded-[18px] p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#2e8623]">
              <MapPin className="size-5" />
              <p className="font-['Be_Vietnam_Pro'] font-semibold text-lg">Diện Tích</p>
            </div>
            <p className="font-['Montserrat'] font-bold text-3xl text-black">
              {currentFarm.area ? `${currentFarm.area.toLocaleString('vi-VN')}` : '---'}
            </p>
            <p className="text-sm text-gray-600">mét vuông</p>
          </div>

          <div className="bg-white border-2 border-[#2e8623] rounded-[18px] p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#2e8623]">
              <Calendar className="size-5" />
              <p className="font-['Be_Vietnam_Pro'] font-semibold text-lg">Ngày Trồng</p>
            </div>
            <p className="font-['Montserrat'] font-bold text-3xl text-black">
              {currentFarm.planting_date ? new Date(currentFarm.planting_date).toLocaleDateString('vi-VN') : '---'}
            </p>
            <p className="text-sm text-gray-600">
              {currentFarm.planting_date ? `${Math.ceil((new Date().getTime() - new Date(currentFarm.planting_date).getTime()) / (1000 * 60 * 60 * 24))} ngày trước` : 'Chưa có thông tin'}
            </p>
          </div>

          <div className="bg-white border-2 border-[#2e8623] rounded-[18px] p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#2e8623]">
              <Calendar className="size-5" />
              <p className="font-['Be_Vietnam_Pro'] font-semibold text-lg">Thu Hoạch</p>
            </div>
            <p className="font-['Montserrat'] font-bold text-3xl text-black">
              {currentFarm.expected_harvest_date ? new Date(currentFarm.expected_harvest_date).toLocaleDateString('vi-VN') : '---'}
            </p>
            <p className="text-sm text-gray-600">
              {cropProgress.daysRemaining > 0 ? `Còn ${cropProgress.daysRemaining} ngày` : cropProgress.daysRemaining < 0 ? `Quá hạn ${Math.abs(cropProgress.daysRemaining)} ngày` : 'Hôm nay!'}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px] relative shrink-0 w-full">
          {/* Left Column - Form Fields */}
          <div className="flex flex-col gap-[25px] md:gap-[30px] items-start justify-center relative shrink-0">
            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[30px] md:px-[70px] py-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                  Loại Cây
                </p>
                <input
                  type="text"
                  defaultValue={currentFarm.crop_type || 'Chưa có thông tin'}
                  className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                  readOnly
                />
              </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[30px] md:px-[70px] py-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                  Giống Cây
                </p>
                <input
                  type="text"
                  defaultValue={currentFarm.variety || 'Chưa có thông tin'}
                  className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                  readOnly
                />
              </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[30px] md:px-[70px] py-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                  Diện Tích
                </p>
                <input
                  type="text"
                  defaultValue={currentFarm.area ? `${currentFarm.area.toLocaleString('vi-VN')} m²` : 'Chưa có thông tin'}
                  className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                  readOnly
                />
              </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[30px] md:px-[70px] py-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                  Vị Trí
                </p>
                <input
                  type="text"
                  defaultValue={currentFarm.location ? `${currentFarm.location.coordinates[1].toFixed(6)}, ${currentFarm.location.coordinates[0].toFixed(6)}` : 'Chưa có thông tin'}
                  className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2 text-sm"
                  readOnly
                  title="Vĩ độ, Kinh độ"
                />
              </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[30px] md:px-[70px] py-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                  Ngày Trồng
                </p>
                <input
                  type="date"
                  defaultValue={currentFarm.planting_date ? currentFarm.planting_date.split('T')[0] : ''}
                  className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                  readOnly
                />
              </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[30px] md:px-[70px] py-0 relative shrink-0 w-full">
              <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                  Ngày Thu Hoạch Dự Kiến
                </p>
                <input
                  type="date"
                  defaultValue={currentFarm.expected_harvest_date ? currentFarm.expected_harvest_date.split('T')[0] : ''}
                  className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                  readOnly
                />
              </div>

              <div className="h-[15px] opacity-0" />

              <p className="font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[26px] md:text-[32px] text-black text-center w-full">
                <span className="block">Ruộng của bạn hiện tại sao rồi?</span>
                <span className="block">Hãy chụp cho bác sĩ xanh Biết!</span>
              </p>

              <button
                onClick={handleOpenModal}
                className="bg-[#2e8623] border border-[#fffcf6] border-solid box-border flex gap-[15px] md:gap-[20px] items-center justify-center px-[20px] md:px-[25px] py-[16px] md:py-[20px] relative rounded-[20px] shrink-0 w-full hover:bg-[#267019] transition-colors"
              >
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[17px] md:text-[20px] text-[#ebf5ed]">
                  Chụp Ngay!
                </p>
                <Camera className="size-[22px] md:size-[27px] text-[#fffcf6]" />
              </button>
            </div>
          </div>

          {/* Right Column - Status and History */}
          <div className="box-border flex flex-col gap-[30px] md:gap-[40px] items-center overflow-clip px-[30px] md:px-[70px] py-0 relative shrink-0">
            <div className="flex flex-col gap-[12px] md:gap-[15px] items-start relative shrink-0 w-full">
              <CropStatusSelector
                farmId={currentFarm.id}
                currentStatus={currentFarm.crop_status}
                onStatusUpdated={handleStatusUpdated}
              />

            </div>

            <div className="box-border flex flex-col gap-[12px] md:gap-[15px] items-start overflow-clip px-0 py-[5px] relative shrink-0 w-full">
              <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[26px] md:text-[32px] text-black text-center w-full">
                Lịch Sử
              </p>

              {currentFarm.status_history && currentFarm.status_history.length > 0 ? (
                [...currentFarm.status_history]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((historyItem, index) => (
                    <div
                      key={index}
                      className={`${index === 0 ? 'bg-[#b5d5b1]' : 'bg-[#ffd2d2]'
                        } box-border flex flex-col gap-[5px] md:gap-[6px] items-start leading-[normal] overflow-clip pb-[12px] pt-[18px] px-[28px] md:px-[38px] relative rounded-[18px] shrink-0 text-black text-center w-full`}
                    >
                      <p className="font-['Be_Vietnam_Pro'] font-semibold relative shrink-0 text-[20px] md:text-[24px]">
                        {CROP_STATUS_LABELS[historyItem.status as keyof typeof CROP_STATUS_LABELS] || historyItem.status}
                      </p>
                      <p className="font-['Be_Vietnam_Pro'] font-medium relative shrink-0 text-[14px] md:text-[16px]">
                        {new Date(historyItem.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-center w-full text-gray-500">Chưa có lịch sử</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Disease Detection Modal */}
      <DiseaseDetectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        farmId={currentFarm.id}
        cropType={currentFarm.crop_type}
      />
    </div>
  );
}
