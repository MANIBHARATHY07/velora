import { BaseRepository } from '../../shared/lib/base-repository';

class ServiceRepository extends BaseRepository {
  constructor() {
    super('ServiceRecords');
  }

  /**
   * @param {string} vehicleId
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getByVehicleIdSorted(vehicleId, userId) {
    const records = await this.getByVehicleId(vehicleId, userId);
    return records.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
  }

  /**
   * @param {string} vehicleId
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  async getLastService(vehicleId, userId) {
    const sorted = await this.getByVehicleIdSorted(vehicleId, userId);
    return sorted[0] ?? null;
  }
}

export const serviceRepository = new ServiceRepository();
