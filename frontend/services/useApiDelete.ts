import { getTokenUser } from '@/action/utils';
import funcUtils from '@/utils/funcUtils';
import { fetchJsonWithAuth } from './fetchWithAuth';

const useApiDelete = async (url: string) => {
  const isServer = typeof window === 'undefined';
  
  return await fetchJsonWithAuth(funcUtils.combineURL(url), {
    method: 'DELETE',
    ...funcUtils.FetchHeaders(isServer ? await getTokenUser() : undefined),
  });
};

export default useApiDelete;
