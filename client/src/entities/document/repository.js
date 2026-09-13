import { BaseRepository } from '../../shared/lib/base-repository';

class DocumentRepository extends BaseRepository {
  constructor() {
    super('Documents');
  }

  /**
   * @param {string} query
   * @param {string} vehicleId
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async search(query, vehicleId, userId) {
    const docs = await this.getByVehicleId(vehicleId, userId);
    const q = query.toLowerCase();
    return docs.filter(
      (d) =>
        (d.extractedText && d.extractedText.toLowerCase().includes(q)) ||
        (d.notes && d.notes.toLowerCase().includes(q)) ||
        (d.name && d.name.toLowerCase().includes(q))
    );
  }

  /**
   * @param {string} type
   * @param {string} vehicleId
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getByType(type, vehicleId, userId) {
    const docs = await this.getByVehicleId(vehicleId, userId);
    return docs.filter((d) => d.type === type);
  }
}

export const documentRepository = new DocumentRepository();
