'use client';

import { useState } from 'react';
import { DiseaseDetectionResponse } from '@/models/ai';
import { detectDiseaseAction } from '@/action/ai';

interface DiseaseDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId?: string;
  cropType?: string;
}

export default function DiseaseDetectionModal({ 
  isOpen, 
  onClose, 
  farmId, 
  cropType 
}: DiseaseDetectionModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Vui lòng chọn ảnh trước khi phân tích');
      return;
    }

    console.log('=== FORM SUBMISSION ===');
    console.log('Selected file:', selectedFile.name, selectedFile.size, selectedFile.type);
    console.log('Farm ID:', farmId);
    console.log('Crop Type:', cropType);
    console.log('Additional Context:', additionalContext);

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (farmId) formData.append('farm_id', farmId);
      if (cropType) formData.append('crop_type', cropType);
      if (additionalContext) formData.append('additional_context', additionalContext);

      console.log('=== FORM DATA CREATED ===');
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}, ${value.size} bytes, ${value.type}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      console.log('=== CALLING SERVER ACTION ===');
      const result = await detectDiseaseAction(formData);
      console.log('=== SERVER ACTION COMPLETED ===');
      console.log('Result:', result);
      
      if (result) {
        setResult(result);
      } else {
        setError('Có lỗi xảy ra khi phân tích ảnh');
      }
    } catch (err) {
      setError('Không thể kết nối đến AI service');
      console.error('Disease detection error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setAdditionalContext('');
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#191f19]">
              Chụp & Phân Bệnh
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Ảnh Cây Trồng
                </label>
                <div className="border-2 border-dashed border-[#2e8623] rounded-[18px] p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Đã chọn: {selectedFile.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">📷</div>
                      <div className="text-gray-600">
                        Kéo thả ảnh hoặc click để chọn
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block bg-[#2e8623] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#267019]"
                      >
                        Chọn Ảnh
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả Thêm (Không bắt buộc)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e8623] focus:border-transparent"
                  rows={4}
                  placeholder="Mô tả triệu chứng, điều kiện thời tiết, loại cây trồng..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full bg-[#2e8623] text-white py-3 rounded-lg hover:bg-[#267019] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Đang phân tích...' : 'Phân Tích Bệnh'}
              </button>
            </form>
          ) : (
            /* Results */
            <div className="space-y-6">
              {/* Detection Result */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-green-800 mb-2">
                  Kết Quả Phân Tích
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Bệnh:</span> {result.detection.disease_name}
                  </div>
                  <div>
                    <span className="font-medium">Độ chính xác:</span> {(result.detection.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Top Predictions */}
              <div>
                <h4 className="font-medium mb-2">Các dự đoán khác:</h4>
                <div className="space-y-1">
                  {result.detection.top_predictions.map((pred, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{pred.disease}</span>
                      <span>{(pred.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Advice */}
              <div>
                <h4 className="font-medium mb-2">Lời khuyên từ AI:</h4>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line text-sm">
                  {result.ai_advice}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setResult(null);
                    setSelectedFile(null);
                  }}
                  className="flex-1 bg-[#2e8623] text-white py-2 rounded-lg hover:bg-[#267019]"
                >
                  Chụp Lại
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
