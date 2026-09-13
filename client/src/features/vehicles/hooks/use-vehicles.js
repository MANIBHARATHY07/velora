import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { vehicleRepository } from '../../../entities/vehicle/repository';

const QUERY_KEY = 'vehicles';

export function useVehicles() {
  const userId = useSelector((s) => s.settings.userId);
  return useQuery({
    queryKey: [QUERY_KEY, userId],
    queryFn: () => vehicleRepository.getAll(userId),
    enabled: !!userId,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  const userId = useSelector((s) => s.settings.userId);
  return useMutation({
    mutationFn: (data) => vehicleRepository.create({ ...data, userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => vehicleRepository.update(id, { ...data, updatedAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => vehicleRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
