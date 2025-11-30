"use client";

import Sidebar from "../Sidebar";
import Link from "next/link";
import { Plus, Pencil, Trash2, Tractor, Sprout, Leaf, Sun, Wheat, CircleOff } from "lucide-react";
import { useState } from "react";
import { TFarm, CROP_STATUS_LABELS, CropStatus } from "@/models/farm";
import AddFieldModal from "./components/AddFieldModal";
import EditFieldModal from "./components/EditFieldModal";
import { deleteFarmAction } from "@/action/farm";
import FarmImage from "@/components/FarmImage";

// Helper function to get icon based on status
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'preparing':
      return <Tractor className="w-full h-full text-[#2e8623]" />;
    case 'planted':
      return <Sprout className="w-full h-full text-[#2e8623]" />;
    case 'growing':
      return <Leaf className="w-full h-full text-[#2e8623]" />;
    case 'flowering':
      return <Sun className="w-full h-full text-yellow-500" />;
    case 'harvested':
      return <Wheat className="w-full h-full text-orange-500" />;
    case 'fallow':
      return <CircleOff className="w-full h-full text-gray-400" />;
    default:
      return <Sprout className="w-full h-full text-[#2e8623]" />;
  }
};

export default function FieldsClient({ fields }: { fields: TFarm[] }) {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<TFarm | null>(null);

  const handleEditClick = (e: React.MouseEvent, farm: TFarm) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFarm(farm);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, farmId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Bạn có chắc chắn muốn xóa ruộng này không?")) {
      const success = await deleteFarmAction(farmId);
      if (success) {
        window.location.reload();
      } else {
        alert("Xóa ruộng thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <>
      <div className="bg-[#fffcf6] flex flex-col md:flex-row items-start relative min-h-screen w-full overflow-hidden">
        <Sidebar activePage="fields" />

        <div className="flex flex-[1_0_0] flex-col gap-[30px] md:gap-[40px] items-center min-h-screen w-full max-w-full relative pb-20 md:pb-8 md:ml-[60px] lg:ml-[72px] overflow-x-hidden">
          <div className="box-border flex flex-col gap-[18px] md:gap-[22px] items-center justify-center px-[20px] md:px-[40px] lg:px-[60px] py-0 relative shrink-0 w-full pt-6 md:pt-8">
            <div className="bg-transparent h-[60px] md:h-[70px] shrink-0 w-full" />
            <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[28px] md:text-[36px] text-black text-center w-full">
              Ruộng Của Bạn
            </p>

            <div className="flex gap-[10px] items-start justify-end relative shrink-0 w-full max-w-[1059px]">
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#2e8623] border border-[#fffcf6] border-solid box-border flex gap-[12px] md:gap-[15px] items-center justify-center px-[18px] md:px-[22px] py-[14px] md:py-[18px] relative rounded-[22px] shrink-0 hover:bg-[#267019] transition-colors"
              >
                <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[16px] md:text-[18px] text-[#ebf5ed]">
                  Thêm Ruộng
                </p>
                <Plus className="size-[22px] md:size-[27px] text-[#fffcf6]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-[1059px]">
              {fields?.length > 0 ? fields.map((field) => (
                <Link
                  key={field.id || field.name}
                  href={`/dashboard/fields/${field.id}`}
                  className="bg-[#fffcf6] border-2 border-[#2e8623] border-solid relative rounded-[14.09px] hover:shadow-lg transition-shadow group h-full flex flex-col"
                >
                  <div className="box-border flex flex-col gap-[20px] md:gap-[23.484px] items-center overflow-clip pb-[28px] md:pb-[35.226px] pt-[18px] md:pt-[23.484px] px-[18px] md:px-[23.484px] relative rounded-[inherit]">
                    <div className="relative h-[140px] md:h-[165.954px] shrink-0 w-full rounded-[8px] overflow-hidden">
                      <FarmImage
                        alt={field.name}
                        src={field.image}
                      />
                    </div>
                    <div className="flex flex-col gap-[5px] md:gap-[6.262px] items-start leading-[normal] relative shrink-0 text-black w-full">
                      <div className="flex justify-between items-start w-full">
                        <p className="font-['Montserrat'] font-semibold relative shrink-0 text-[20px] md:text-[25.05px]">
                          {field.name || 'N/A'}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => handleEditClick(e, field)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                            title="Sửa thông tin"
                          >
                            <Pencil size={18} className="text-[#2e8623]" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, field.id)}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors z-10"
                            title="Xóa ruộng"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className="font-['Montserrat'] relative shrink-0 text-[14px] md:text-[15.656px] w-full">
                        Ngày trồng: {field.planting_date ? new Date(field.planting_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                      <p className="font-['Montserrat'] relative shrink-0 text-[14px] md:text-[15.656px] w-full">
                        Tình Trạng: {CROP_STATUS_LABELS[field.crop_status as CropStatus] || field.crop_status || 'N/A'}
                      </p>
                      <p className="font-['Montserrat'] relative shrink-0 text-[14px] md:text-[15.656px] w-full">
                        Loại cây: {field.crop_type || 'N/A'}
                      </p>
                      <p className="font-['Montserrat'] relative shrink-0 text-[14px] md:text-[15.656px] w-full">
                        Diện tích: {field.area ? `${field.area} m²` : 'N/A'}
                      </p>
                    </div>
                    <div className="absolute h-[60px] w-[60px] right-[20px] bottom-[28px] opacity-80">
                      {getStatusIcon(field.crop_status)}
                    </div>
                  </div>
                </Link>
              )) : (
                <p className="text-center text-gray-500 w-full py-8 col-span-full">Không có dữ liệu ruộng</p>
              )}
            </div>
          </div>
        </div>
      </div >

      <AddFieldModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        farms={fields}
      />

      <EditFieldModal
        showModal={showEditModal}
        onClose={() => setShowEditModal(false)}
        farm={selectedFarm}
      />
    </>
  );
}
