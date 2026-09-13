import { BaseRepository } from '../../shared/lib/base-repository';

class ReminderRepository extends BaseRepository {
  constructor() {
    super('Reminders');
  }
}

export const reminderRepository = new ReminderRepository();
