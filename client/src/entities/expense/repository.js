import { BaseRepository } from '../../shared/lib/base-repository';

class ExpenseRepository extends BaseRepository {
  constructor() {
    super('Expenses');
  }
}

export const expenseRepository = new ExpenseRepository();
