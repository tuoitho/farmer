'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { CROP_STATUS_LABELS } from '@/models/farm';
import IconSearch from "@/public/mingcute--search-fill.png"

const imgFrame2 = "https://www.figma.com/api/mcp/asset/2781859a-9304-4399-9002-5e1b53c31c3c";

export default function SearchInput() {
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    // Initialize state from URL params, but strip time if present for date inputs
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search')?.toString() || '');
    const [startDate, setStartDate] = useState(() => {
        const date = searchParams.get('start_date')?.toString();
        return date ? date.split('T')[0] : '';
    });
    const [endDate, setEndDate] = useState(() => {
        const date = searchParams.get('end_date')?.toString();
        return date ? date.split('T')[0] : '';
    });
    const [cropStatus, setCropStatus] = useState(searchParams.get('crop_status')?.toString() || '');
    const [isOpen, setIsOpen] = useState(false);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);

        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }

        if (startDate) {
            // Append time to make it a valid ISO datetime for backend
            params.set('start_date', `${startDate}T00:00:00`);
        } else {
            params.delete('start_date');
        }

        if (endDate) {
            // Append time to make it a valid ISO datetime for backend
            params.set('end_date', `${endDate}T23:59:59`);
        } else {
            params.delete('end_date');
        }

        if (cropStatus) {
            params.set('crop_status', cropStatus);
        } else {
            params.delete('crop_status');
        }

        replace(`?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col gap-3 md:gap-4 w-full max-w-[900px] items-center justify-center px-4 md:px-0">
            {/* Search input */}
            <div className="bg-[#ebf5ed] border border-[#2e8623] border-solid box-border flex gap-[10px] h-[45px] md:h-[60px] items-center justify-end px-[11px] py-[8px] relative rounded-[18px] shrink-0 w-full">
                <input
                    type="text"
                    className="flex-1 bg-transparent outline-none px-2 md:px-4 text-[14px] md:text-[16px]"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Date range inputs */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-center justify-center">
                <div className="bg-[#ebf5ed] border border-[#2e8623] border-solid box-border flex gap-[10px] h-[45px] md:h-[60px] items-center px-[11px] py-[8px] relative rounded-[18px] shrink-0 w-full md:flex-1">
                    <input
                        type="date"
                        className="flex-1 bg-transparent outline-none text-[14px] md:text-[15px]"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Từ ngày"
                    />
                </div>
                <span className="text-[#2e8623] font-bold hidden md:block">-</span>
                <div className="bg-[#ebf5ed] border border-[#2e8623] border-solid box-border flex gap-[10px] h-[45px] md:h-[60px] items-center px-[11px] py-[8px] relative rounded-[18px] shrink-0 w-full md:flex-1">
                    <input
                        type="date"
                        className="flex-1 bg-transparent outline-none text-[14px] md:text-[15px]"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Đến ngày"
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-center justify-center">
                <div className="relative w-full md:w-auto md:flex-1">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-[#ebf5ed] border border-[#2e8623] border-solid box-border flex gap-[10px] h-[45px] md:h-[60px] items-center justify-between px-[11px] py-[8px] relative rounded-[18px] shrink-0 w-full outline-none font-['Be_Vietnam_Pro'] text-[14px] md:text-[16px] text-left"
                    >
                        <span className="truncate">
                            {cropStatus ? CROP_STATUS_LABELS[cropStatus as keyof typeof CROP_STATUS_LABELS] : "Tất cả trạng thái"}
                        </span>
                        <svg
                            className={`w-5 h-5 transition-transform shrink-0 text-[#2e8623] ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsOpen(false)}
                            />
                            <div className="absolute z-50 w-full mt-2 bg-white border border-[#2e8623] rounded-[18px] shadow-lg max-h-[300px] overflow-y-auto">
                                <button
                                    onClick={() => {
                                        setCropStatus("");
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left font-['Be_Vietnam_Pro'] text-[14px] md:text-[16px] hover:bg-[#ebf5ed] transition-colors flex items-center justify-between ${cropStatus === "" ? 'bg-[#ebf5ed]' : ''
                                        }`}
                                >
                                    <span>Tất cả trạng thái</span>
                                    {cropStatus === "" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2e8623]">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </button>
                                {Object.entries(CROP_STATUS_LABELS).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setCropStatus(key);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left font-['Be_Vietnam_Pro'] text-[14px] md:text-[16px] hover:bg-[#ebf5ed] transition-colors flex items-center justify-between ${cropStatus === key ? 'bg-[#ebf5ed]' : ''
                                            }`}
                                    >
                                        <span>{label}</span>
                                        {cropStatus === key && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2e8623]">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={handleSearch}
                    className="relative shrink-0 w-full md:w-[50px] h-[45px] md:h-[50px] bg-[#2e8623] rounded-[18px] md:rounded-full flex items-center justify-center hover:bg-[#267019] transition-colors text-white gap-2"
                >
                    <span className="md:hidden font-semibold text-[15px]">Tìm kiếm</span>
                    <Image alt="" className="block max-w-none w-[20px] md:w-[30px] h-[20px] md:h-[30px]" src={IconSearch} width={40} height={40} />
                </button>
            </div>
        </div>
    );
}
