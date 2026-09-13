import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { documentRepository } from '../../../entities/document/repository';

const QUERY_KEY = 'documents';

export function useDocuments(vehicleId) {
  const userId = useSelector((s) => s.settings.userId);
  return useQuery({
    queryKey: [QUERY_KEY, vehicleId, userId],
    queryFn: () => documentRepository.getByVehicleId(vehicleId, userId),
    enabled: !!vehicleId && !!userId,
  });
}

export function useDocumentsByType(type, vehicleId) {
  const userId = useSelector((s) => s.settings.userId);
  return useQuery({
    queryKey: [QUERY_KEY, 'byType', type, vehicleId, userId],
    queryFn: () => documentRepository.getByType(type, vehicleId, userId),
    enabled: !!vehicleId && !!userId && !!type,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  const userId = useSelector((s) => s.settings.userId);
  return useMutation({
    mutationFn: (data) => documentRepository.create({ ...data, userId, createdAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
