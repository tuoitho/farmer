'use client';

import { useState, useEffect, useRef } from 'react';
import apiConfig from '@/common/config/api';

interface Province {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
}

interface ProvinceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function ProvinceAutocomplete({
  value,
  onChange,
  placeholder = "Chọn tỉnh/thành phố",
  disabled = false,
  className = "",
}: ProvinceAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiConfig.Location.getProvinces);
        if (response.ok) {
          const data = await response.json();
          // API returns array directly, not wrapped in results
          setProvinces(Array.isArray(data) ? data : []);
          setFilteredProvinces(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Filter provinces based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = provinces.filter(province =>
        province.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        province.codename.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(provinces);
    }
  }, [searchTerm, provinces]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearchTerm(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm('');
  };

  const handleProvinceSelect = (province: Province) => {
    onChange(province.name);
    setSearchTerm(''); // Clear search term
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={`bg-[#ebf5ed] border border-[#2e8623] border-solid h-[50px] md:h-[55px] rounded-[18px] shrink-0 w-full px-4 text-[15px] md:text-[16px] focus:outline-none focus:ring-2 focus:ring-[#2e8623] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
      
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-9999 mt-1 bg-white border border-[#2e8623] rounded-[18px] shadow-lg max-h-60 overflow-y-auto"
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            border: '2px solid #2e8623',
            zIndex: 9999,
            marginTop: '4px',
            borderRadius: '18px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxHeight: '240px',
            overflowY: 'auto'
          }}
        >
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              Đang tải...
            </div>
          ) : filteredProvinces.length > 0 ? (
            filteredProvinces.map((province) => (
              <div
                key={province.code}
                onClick={() => handleProvinceSelect(province)}
                className="px-4 py-3 hover:bg-[#ebf5ed] cursor-pointer transition-colors first:rounded-t-[18px] last:rounded-b-[18px]"
              >
                <div className="font-['Be_Vietnam_Pro'] text-[15px] md:text-[16px] text-[#191f19]">
                  {province.name}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              Không tìm thấy tỉnh/thành phố
            </div>
          )}
        </div>
      )}
    </div>
  );
}
