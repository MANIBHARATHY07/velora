import { getDataStore } from './catalyst';

/**
 * Maps a Catalyst row object to a plain JS object with `id` instead of `ROWID`.
 * @param {object} row
 * @returns {object}
 */
function mapRow(row) {
  const { ROWID, ...rest } = row;
  return { id: String(ROWID), ...rest };
}

export class BaseRepository {
  /** @param {string} segmentName */
  constructor(segmentName) {
    this.segmentName = segmentName;
  }

  _segment() {
    return getDataStore().segment(this.segmentName);
  }

  /**
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getAll(userId) {
    const rows = await this._segment().getRows();
    return rows.filter((r) => r.userId === userId).map(mapRow);
  }

  /**
   * @param {string} rowId
   * @returns {Promise<object>}
   */
  async getById(rowId) {
    const row = await this._segment().getRow(rowId);
    return mapRow(row);
  }

  /**
   * @param {string} vehicleId
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getByVehicleId(vehicleId, userId) {
    const all = await this.getAll(userId);
    return all.filter((r) => r.vehicleId === vehicleId);
  }

  /**
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(data) {
    const row = await this._segment().insertRow(data);
    return mapRow(row);
  }

  /**
   * @param {string} rowId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(rowId, data) {
    const row = await this._segment().updateRow({ ROWID: rowId, ...data });
    return mapRow(row);
  }

  /**
   * @param {string} rowId
   * @returns {Promise<void>}
   */
  async delete(rowId) {
    await this._segment().deleteRow(rowId);
  }
}
