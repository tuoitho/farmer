import { TFarm, TCreateFarm, CROP_STATUS_LABELS } from "@/models/farm";
import { updateFarmAction } from "@/action/farm";
import Image from "next/image";
import { useState } from "react";

async function handleUpdateField(id: string, fieldData: Partial<TCreateFarm>): Promise<TFarm | null> {
    try {
        const result = await updateFarmAction(id, fieldData);
        return result;
    } catch (error) {
        console.error('Error updating field:', error);
        return null;
    }
}

interface EditFieldModalProps {
    showModal: boolean;
    onClose: () => void;
    farm: TFarm | null;
}

interface EditFarmFormProps {
    farm: TFarm;
    onClose: () => void;
}

function EditFarmForm({ farm, onClose }: EditFarmFormProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(farm.image || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const fieldData: Partial<TCreateFarm> = {
            name: data.get('name') as string,
            crop_type: data.get('crop_type') as string,
            variety: data.get('variety') as string || undefined,
            area: data.get('area') as string,
            planting_date: data.get('planting_date') as string,
            expected_harvest_date: data.get('expected_harvest_date') as string,
            crop_status: data.get('crop_status') as string,
            image: data.get('image') as File || null,
        };

        const result = await handleUpdateField(farm.id, fieldData);
        if (result) {
            onClose();
            window.location.reload();
        } else {
            alert('Có lỗi xảy ra khi cập nhật ruộng. Vui lòng thử lại.');
        }
    };

    // Helper to format date for input
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-[25px] w-full">
            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
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

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                    <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                        Tên Ruộng
                    </p>
                    <input
                        type="text"
                        name="name"
                        defaultValue={farm.name}
                        className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                        placeholder="VD: Ruộng Lúa Đông..."
                        required
                    />
                </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                    <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                        Loại Cây
                    </p>
                    <input
                        type="text"
                        name="crop_type"
                        defaultValue={farm.crop_type}
                        className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                        placeholder="VD: Lúa, Cà chua..."
                        required
                    />
                </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                    <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                        Giống Cây
                    </p>
                    <input
                        type="text"
                        name="variety"
                        defaultValue={farm.variety}
                        className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                        placeholder="VD: OM 18, IR64..."
                    />
                </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                    <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                        Diện Tích (m²)
                    </p>
                    <input
                        type="number"
                        name="area"
                        defaultValue={farm.area}
                        className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                        placeholder="Nhập diện tích..."
                        required
                    />
                </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                    <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                        Ngày Trồng
                    </p>
                    <input
                        type="date"
                        name="planting_date"
                        defaultValue={formatDate(farm.planting_date)}
                        className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2"
                        required
                    />
                </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-start overflow-clip px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                    <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                        Tình Trạng
                    </p>
                    <select
                        name="crop_status"
                        defaultValue={farm.crop_status}
                        className="bg-[#ebf5ed] border border-[#2e8623] border-solid h-[55px] rounded-[18px] shrink-0 w-full px-4 outline-none focus:border-2 appearance-none"
                        required
                    >
                        {Object.entries(CROP_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="box-border flex flex-col gap-[10px] items-center overflow-clip px-[50px] md:px-[70px] py-0 relative shrink-0 w-full">
                <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                    <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] relative shrink-0 text-[18px] md:text-[20px] text-[#191f19] w-full">
                        Ngày Thu Hoạch Dự Kiến
                    </p>
                    <input
                        type="date"
                        name="expected_harvest_date"
                        defaultValue={formatDate(farm.expected_harvest_date)}
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
                            Cập Nhật
                        </p>
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function EditFieldModal({ showModal, onClose, farm }: EditFieldModalProps) {
    if (!showModal || !farm) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white box-border flex flex-col gap-[25px] md:gap-[30px] items-start pb-[40px] md:pb-[50px] pt-[60px] md:pt-[80px] px-0 relative rounded-[18px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
                <div className="flex gap-[20px] md:gap-[30px] items-center justify-center relative shrink-0 w-full">
                    <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[36px] md:text-[48px] text-black text-center">
                        Sửa Thông Tin Ruộng
                    </p>
                </div>

                <EditFarmForm farm={farm} onClose={onClose} key={farm.id} />
            </div>
        </div>
    );
}
