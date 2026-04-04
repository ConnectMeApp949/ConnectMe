import { useInfiniteQuery } from '@tanstack/react-query';
import { searchVendors, VendorSearchParams } from '../services/api';

export function useVendorSearch(params: VendorSearchParams = {}) {
  return useInfiniteQuery({
    queryKey: ['vendors', params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await searchVendors({ ...params, page: pageParam });
      return {
        vendors: res.data ?? [],
        meta: res.meta ?? { page: pageParam, perPage: 20, total: 0, totalPages: 0 },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
}
