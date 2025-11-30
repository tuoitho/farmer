'use client';

import { useState } from 'react';
import { CROP_STATUS_LABELS, CropStatus } from '@/models/farm';
import { updateCropStatusAction } from '@/action/farm';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

interface CropStatusSelectorProps {
  farmId: string;
  currentStatus: string;
  onStatusUpdated?: (newStatus: string) => void;
}

export default function CropStatusSelector({ 
  farmId, 
  currentStatus,
  onStatusUpdated 
}: CropStatusSelectorProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === selectedStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    
    try {
      const result = await updateCropStatusAction(farmId, newStatus);
      
      if (result.success) {
        setSelectedStatus(newStatus);
        toast.success('Cập nhật trạng thái thành công!');
        onStatusUpdated?.(newStatus);
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi cập nhật trạng thái');
      console.error('Update status error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string): string => {
    if (status === 'fallow') {
      return 'bg-gray-100 border-gray-400 text-gray-700';
    }
    if (status === 'harvested') {
      return 'bg-green-100 border-green-400 text-green-700';
    }
    if (status === 'flowering' || status === 'growing') {
      return 'bg-blue-100 border-blue-400 text-blue-700';
    }
    return 'bg-yellow-100 border-yellow-400 text-yellow-700';
  };

  return (
    <div className="relative w-full">
      <p className="capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] mb-[10px] text-[18px] md:text-[20px] text-[#191f19]">
        Trạng Thái
      </p>
      
      {/* Current Status Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`${getStatusColor(selectedStatus)} border-2 border-solid h-[55px] rounded-[18px] w-full px-4 outline-none font-['Be_Vietnam_Pro'] font-medium text-left flex items-center justify-between transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span>
          {CROP_STATUS_LABELS[selectedStatus as CropStatus] || selectedStatus}
        </span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-[#2e8623] rounded-[18px] shadow-lg max-h-[300px] overflow-y-auto">
          {Object.entries(CROP_STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              onClick={() => handleUpdateStatus(status)}
              disabled={isUpdating}
              className={`w-full px-4 py-3 text-left font-['Be_Vietnam_Pro'] hover:bg-[#ebf5ed] transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed ${
                status === selectedStatus ? 'bg-[#ebf5ed]' : ''
              }`}
            >
              <span>{label}</span>
              {status === selectedStatus && (
                <Check className="w-5 h-5 text-[#2e8623]" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 rounded-[18px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e8623]"></div>
        </div>
      )}
    </div>
  );
}
