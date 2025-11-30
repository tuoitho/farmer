import { getTokenUser } from '@/action/utils';
import funcUtils from '@/utils/funcUtils';
import { fetchJsonWithAuth } from './fetchWithAuth';

const useApiPut = async (url: string, payload: any) => {
  const isServer = typeof window === 'undefined';

  return await fetchJsonWithAuth(funcUtils.combineURL(url), {
    method: 'PUT',
    body: JSON.stringify(payload),
    ...funcUtils.FetchHeaders(isServer ? await getTokenUser() : undefined, false),
  });
};

const useApiPutFormData = async <T = any, R = any>(url: string, payload: FormData): Promise<R> => {
  const isServer = typeof window === 'undefined';
  const token = isServer ? await getTokenUser() : undefined;

  const headers = funcUtils.FetchHeaders(token || undefined);
  // Remove Content-Type to let browser set multipart/form-data boundary
  const { headers: { 'Content-Type': _, ...headersWithoutContentType } } = headers;

  const response = await fetchJsonWithAuth<R>(funcUtils.combineURL(url), {
    method: 'PUT',
    body: payload,
    headers: headersWithoutContentType
  });

  return response as R;
};

export default useApiPut;
export { useApiPutFormData };
