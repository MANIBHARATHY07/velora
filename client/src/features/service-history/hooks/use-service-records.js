import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { serviceRepository } from '../../../entities/service-record/repository';

const QUERY_KEY = 'serviceRecords';

export function useServiceRecords(vehicleId) {
  const userId = useSelector((s) => s.settings.userId);
  return useQuery({
    queryKey: [QUERY_KEY, vehicleId, userId],
    queryFn: () => serviceRepository.getByVehicleIdSorted(vehicleId, userId),
    enabled: !!vehicleId && !!userId,
  });
}

export function useLastService(vehicleId) {
  const userId = useSelector((s) => s.settings.userId);
  return useQuery({
    queryKey: [QUERY_KEY, 'last', vehicleId, userId],
    queryFn: () => serviceRepository.getLastService(vehicleId, userId),
    enabled: !!vehicleId && !!userId,
  });
}

export function useCreateServiceRecord() {
  const qc = useQueryClient();
  const userId = useSelector((s) => s.settings.userId);
  return useMutation({
    mutationFn: (data) => serviceRepository.create({ ...data, userId, createdAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
