import Image from "next/image";
import { TFarm, TCreateFarm } from "@/models/farm";
import { createFarmAction } from "@/action/farm";
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Import Dynamic để tắt SSR cho Map
const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-[18px] flex items-center justify-center">
      <p className="text-gray-500 font-['Be_Vietnam_Pro']">Đang tải bản đồ...</p>
    </div>
  ),
});

async function handleAddField(fieldData: TCreateFarm): Promise<TFarm | null> {
  try {
    const result = await createFarmAction(fieldData);
    return result;
  } catch (error) {
    console.error('Error adding field:', error);
    return null;
  }
}

interface AddFieldModalProps {
  showModal: boolean;
  onClose: () => void;
  farms: TFarm[];
}

export default function AddFieldModal({ showModal, onClose }: AddFieldModalProps) {
  const [locationData, setLocationData] = useState({
    address: '',
    latitude: '',
    longitude: '',
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!showModal) return null;

  const handleMapSelect = (address: string, lat: number, lng: number) => {
    setLocationData({
      address,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const fieldData: TCreateFarm = {
      name: formData.get('name') as string,
      crop_type: formData.get('crop_type') as string,
      variety: formData.get('variety') as string || undefined,
      area: formData.get('area') as string,
      planting_date: formData.get('planting_date') as string,
      expected_harvest_date: formData.get('expected_harvest_date') as string,
      latitude: locationData.latitude || (formData.get('latitude') as string),
      longitude: locationData.longitude || (formData.get('longitude') as string),
      image: formData.get('image') as File || null,
    };

    const result = await handleAddField(fieldData);
    if (result) {
      onClose();
      window.location.reload();
    } else {
      alert('Có lỗi xảy ra khi tạo ruộng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100 p-4">
      <div className="bg-white box-border flex flex-col gap-[25px] md:gap-[30px] items-start pb-[40px] md:pb-[50px] pt-[30px] md:pt-[40px] px-0 relative rounded-[18px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex gap-[20px] md:gap-[30px] items-center justify-center relative shrink-0 w-full px-[50px] md:px-[70px]">
          <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[32px] md:text-[40px] text-black text-center">
            Thêm Ruộng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[25px] w-full">
          <div className="box-border flex flex-col gap-[10px] items-start px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Hình Ảnh
              </p>
              <label className="flex flex-col items-center justify-center w-full h-[200px] border-2 border-[#2e8623] border-dashed rounded-[18px] cursor-pointer bg-[#ebf5ed] hover:bg-[#d5e5d1] transition-colors overflow-hidden relative">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-[#2e8623]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p className="mb-2 text-sm text-[#191f19]"><span className="font-semibold">Nhấn để tải lên</span></p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="box-border flex flex-col gap-[10px] items-start px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Tên Ruộng
              </p>
              <input
                type="text"
                name="name"
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                placeholder="VD: Ruộng Lúa Đông, Vườn Cà Chua..."
                required
              />
            </div>
          </div>

          <div className="box-border flex flex-col gap-[10px] items-start px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Loại Cây
              </p>
              <input
                type="text"
                name="crop_type"
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                placeholder="VD: Lúa, Cà chua, Dưa hấu..."
                required
              />
            </div>
          </div>

          <div className="box-border flex flex-col gap-[10px] items-start px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Giống Cây
              </p>
              <input
                type="text"
                name="variety"
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                placeholder="VD: OM 18, IR64, Hoa Vàng..."
              />
            </div>
          </div>

          <div className="box-border flex flex-col gap-[10px] items-start px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Diện Tích
              </p>
              <input
                type="text"
                name="area"
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                placeholder="Nhập diện tích..."
                required
              />
            </div>
          </div>

          <div className="box-border flex flex-col gap-[10px] items-start px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Vị Trí Ruộng
              </p>
              <div className="w-full">
                <MapPicker onAddressFound={handleMapSelect} />
              </div>
            </div>
          </div>

          {/* Hidden inputs để lưu tọa độ */}
          <input type="hidden" name="latitude" value={locationData.latitude} />
          <input type="hidden" name="longitude" value={locationData.longitude} />

          {/* Hiển thị tọa độ đã chọn (optional - có thể ẩn) */}
          {locationData.latitude && locationData.longitude && (
            <div className="box-border flex flex-col gap-[10px] items-start px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
              <div className="flex gap-[15px] items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-['Be_Vietnam_Pro'] text-gray-600">
                    Vĩ độ: <span className="font-semibold text-[#191f19]">{parseFloat(locationData.latitude).toFixed(6)}</span>
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-['Be_Vietnam_Pro'] text-gray-600">
                    Kinh độ: <span className="font-semibold text-[#191f19]">{parseFloat(locationData.longitude).toFixed(6)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="box-border flex flex-col gap-[10px] items-start px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Ngày Trồng
              </p>
              <input
                type="date"
                name="planting_date"
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                required
              />
            </div>
          </div>

          <div className="box-border flex flex-col gap-[10px] items-center px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                Ngày Thu Hoạch Dự Kiến
              </p>
              <input
                type="date"
                name="expected_harvest_date"
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                required
              />
            </div>

            <div className="h-[15px] w-[36px] opacity-0" />

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#ebf5ed] border border-[#2e8623] border-solid box-border flex gap-[15px] md:gap-[20px] items-center justify-center px-[20px] md:px-[25px] py-[16px] md:py-[20px] relative rounded-[20px] flex-1 hover:bg-[#d5e5d1] transition-colors"
              >
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[17px] md:text-[20px] text-[#191f19]">
                  Hủy
                </p>
              </button>

              <button
                type="submit"
                className="bg-[#2e8623] border border-[#fffcf6] border-solid box-border flex gap-[15px] md:gap-[20px] items-center justify-center px-[20px] md:px-[25px] py-[16px] md:py-[20px] relative rounded-[20px] flex-1 hover:bg-[#267019] transition-colors"
              >
                <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[17px] md:text-[20px] text-[#ebf5ed]">
                  Xác Nhận
                </p>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
