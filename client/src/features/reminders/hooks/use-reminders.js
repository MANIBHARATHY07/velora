import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { reminderRepository } from '../../../entities/reminder/repository';

const QUERY_KEY = 'reminders';

export function useReminders(vehicleId) {
  const userId = useSelector((s) => s.settings.userId);
  return useQuery({
    queryKey: [QUERY_KEY, vehicleId, userId],
    queryFn: () => reminderRepository.getByVehicleId(vehicleId, userId),
    enabled: !!vehicleId && !!userId,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  const userId = useSelector((s) => s.settings.userId);
  return useMutation({
    mutationFn: (data) =>
      reminderRepository.create({ ...data, userId, completed: false, createdAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useToggleReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }) => reminderRepository.update(id, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
