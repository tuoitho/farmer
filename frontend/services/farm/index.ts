import { TFarm } from '@/models/farm';
import useApiPost, { useApiPostFormData } from '../useApiPost';
import useApiGet from '../useApiGet';
import useApiPut, { useApiPutFormData } from '../useApiPut';
import useApiDelete from '../useApiDelete';
import { API_ROUTE } from '@/common/config';

export default {
  createFarm: (payload: FormData) => {
    return useApiPostFormData(API_ROUTE.Farm.createFarm, payload);
  },
  getFarms: (search?: string, startDate?: string, endDate?: string, cropStatus?: string) => {
    let url = API_ROUTE.Farm.getFarms;
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (cropStatus) params.append('crop_status', cropStatus);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('Calling API:', url);
    return useApiGet(url);
  },
  getFarmById: (id: string) => {
    return useApiGet(API_ROUTE.Farm.getFarmById.replace(':farmId', id));
  },
  updateFarm: (id: string, payload: FormData) => {
    return useApiPutFormData(API_ROUTE.Farm.updateFarm.replace(':farmId', id), payload);
  },
  updateCropStatus: (id: string, cropStatus: string) => {
    // Backend expects crop_status as query parameter, not in body
    const url = `${API_ROUTE.Farm.updateCropStatus.replace(':farmId', id)}?crop_status=${encodeURIComponent(cropStatus)}`;
    return useApiPut(url, {});
  },
  deleteFarm: (id: string) => {
    return useApiDelete(API_ROUTE.Farm.deleteFarm.replace(':farmId', id));
  },
};