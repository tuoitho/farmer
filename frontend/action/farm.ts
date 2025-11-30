'use server';

import { TFarm, TCreateFarm } from '@/models/farm';
import farmApi from '@/services/farm';
import { revalidatePath } from 'next/cache';

interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
}

export async function getFarmsAction(): Promise<{ success: boolean; data?: TFarm[]; error?: string }> {
  try {
    console.log('🌾 getFarmsAction: Starting...');
    const response = await farmApi.getFarms();
    console.log('🌾 getFarmsAction: Response:', response);

    const apiResponse = response as ApiResponse<TFarm[]>;

    if (apiResponse?.success && apiResponse?.data) {
      console.log('🌾 getFarmsAction: Success with data');
      return { success: true, data: apiResponse.data };
    }

    // Handle different response formats
    const farms = (apiResponse?.data || apiResponse) as TFarm[] | null;

    if (Array.isArray(farms)) {
      console.log('🌾 getFarmsAction: Success with array');
      return { success: true, data: farms };
    }

    console.log('🌾 getFarmsAction: Failed - no valid data');
    return {
      success: false,
      error: apiResponse?.message || 'Không thể lấy danh sách ruộng'
    };
  } catch (error) {
    console.error('❌ Get farms error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    };
  }
}

export async function createFarmAction(fieldData: TCreateFarm): Promise<TFarm | null> {
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('name', fieldData.name);
    formData.append('latitude', fieldData.latitude || '0');
    formData.append('longitude', fieldData.longitude || '0');
    formData.append('crop_type', fieldData.crop_type);
    if (fieldData.variety) formData.append('variety', fieldData.variety);
    if (fieldData.area) formData.append('area', fieldData.area);
    formData.append('crop_status', 'preparing');
    formData.append('planting_date', new Date(fieldData.planting_date).toISOString());
    formData.append('expected_harvest_date', new Date(fieldData.expected_harvest_date).toISOString());

    if (fieldData.image) {
      formData.append('image', fieldData.image);
    }

    const response = await farmApi.createFarm(formData);
    const apiResponse = response as ApiResponse<TFarm>;
    let farm = null;

    if (apiResponse?.success && apiResponse?.data) {
      farm = apiResponse.data;
    } else {
      const responseData = apiResponse?.data as Record<string, unknown> | undefined;
      farm = (responseData?.data ||
        responseData?.farm ||
        apiResponse?.data ||
        apiResponse) as TFarm | null;
    }

    return farm;
  } catch (error) {
    console.error('Create farm error:', error);
    return null;
  }
}

export async function updateFarmAction(id: string, fieldData: Partial<TCreateFarm>): Promise<TFarm | null> {
  try {
    console.log('updateFarmAction called with:', { id, fieldData });

    // Create FormData object
    const formData = new FormData();
    if (fieldData.name) formData.append('name', fieldData.name);
    if (fieldData.crop_type) formData.append('crop_type', fieldData.crop_type);
    if (fieldData.variety) formData.append('variety', fieldData.variety);
    if (fieldData.area) formData.append('area', fieldData.area);
    if (fieldData.crop_status) formData.append('crop_status', fieldData.crop_status);
    if (fieldData.planting_date) formData.append('planting_date', new Date(fieldData.planting_date).toISOString());
    if (fieldData.expected_harvest_date) formData.append('expected_harvest_date', new Date(fieldData.expected_harvest_date).toISOString());

    if (fieldData.image) {
      formData.append('image', fieldData.image);
    }

    console.log('Sending payload to backend');

    const response = await farmApi.updateFarm(id, formData);
    console.log('Backend response:', response);

    const apiResponse = response as ApiResponse<TFarm>;
    let farm = null;

    if (apiResponse?.success && apiResponse?.data) {
      farm = apiResponse.data;
    } else {
      const responseData = apiResponse?.data as Record<string, unknown> | undefined;
      farm = (responseData?.data ||
        responseData?.farm ||
        apiResponse?.data ||
        apiResponse) as TFarm | null;
    }

    return farm;
  } catch (error) {
    console.error('Update farm error:', error);
    return null;
  }
}

export async function deleteFarmAction(id: string): Promise<boolean> {
  try {
    await farmApi.deleteFarm(id);
    return true;
  } catch (error) {
    console.error('Delete farm error:', error);
    return false;
  }
}

export async function updateCropStatusAction(
  farmId: string,
  cropStatus: string
): Promise<{ success: boolean; error?: string; data?: TFarm }> {
  try {
    console.log('updateCropStatusAction called with:', { farmId, cropStatus });

    // Backend expects crop_status as query parameter
    const response = await farmApi.updateCropStatus(farmId, cropStatus);
    console.log('Backend response:', JSON.stringify(response));

    const apiResponse = response as ApiResponse<TFarm>;

    if (apiResponse?.success && apiResponse?.data) {
      revalidatePath(`/dashboard/fields/${farmId}`);
      revalidatePath('/dashboard/fields'); // Cập nhật cả danh sách bên ngoài
      return { success: true, data: apiResponse.data };
    }

    // Handle different response formats
    const responseData = apiResponse?.data as Record<string, unknown> | undefined;
    const farm = (responseData?.data ||
      responseData?.farm ||
      apiResponse?.data ||
      apiResponse) as TFarm | null;

    if (farm && farm.id) {
      return { success: true, data: farm };
    }

    return {
      success: false,
      error: apiResponse?.message || 'Không thể cập nhật trạng thái cây trồng'
    };
  } catch (error) {
    console.error('Update crop status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    };
  }
}