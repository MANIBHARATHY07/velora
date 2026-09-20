import { getDataStore, unwrap } from './catalyst';

/**
 * Maps a Catalyst row object to a plain JS object with `id` instead of `ROWID`.
 * @param {object} row
 * @returns {object}
 */
function mapRow(row) {
  if (!row) return row;
  const { ROWID, ...rest } = row;
  return { id: String(ROWID), ...rest };
}

/**
 * @param {object} response
 * @returns {object[]}
 */
function rowsFrom(response) {
  const content = unwrap(response);
  if (Array.isArray(content)) return content;
  if (Array.isArray(content?.rows)) return content.rows;
  if (Array.isArray(content?.data)) return content.data;
  return [];
}

export class BaseRepository {
  /** @param {string} segmentName */
  constructor(segmentName) {
    this.segmentName = segmentName;
  }

  _table() {
    return getDataStore().tableId(this.segmentName);
  }

  /**
   * @returns {Promise<object[]>}
   */
  async _getAllRows() {
    const table = this._table();
    const rows = [];
    let nextToken;
    let guard = 0;

    while (guard < 20) {
      guard += 1;
      const response = await table.getPagedRows({ next_token: nextToken, max_rows: 200 });
      const batch = rowsFrom(response);
      rows.push(...batch);

      const content = unwrap(response) || {};
      const more = Boolean(response?.more_records ?? content.more_records);
      const token = response?.next_token ?? content.next_token;
      if (!more || !token || !batch.length || token === nextToken) break;
      nextToken = token;
    }

    return rows;
  }

  /**
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getAll(userId) {
    const rows = await this._getAllRows();
    return rows.filter((r) => String(r.userId) === String(userId)).map(mapRow);
  }

  /**
   * @param {string} rowId
   * @returns {Promise<object>}
   */
  async getById(rowId) {
    const response = await this._table().rowId(String(rowId)).get();
    return mapRow(unwrap(response));
  }

  /**
   * @param {string} vehicleId
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getByVehicleId(vehicleId, userId) {
    const all = await this.getAll(userId);
    return all.filter((r) => String(r.vehicleId) === String(vehicleId));
  }

  /**
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(data) {
    const response = await this._table().addRow([data]);
    return mapRow(rowsFrom(response)[0]);
  }

  /**
   * @param {string} rowId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(rowId, data) {
    const response = await this._table().updateRow([{ ...data, ROWID: rowId }]);
    return mapRow(rowsFrom(response)[0]);
  }

  /**
   * @param {string} rowId
   * @returns {Promise<void>}
   */
  async delete(rowId) {
    const table = this._table();
    if (typeof table.deleteRow === 'function') {
      await table.deleteRow(rowId);
      return;
    }
    await table.rowId(String(rowId)).delete();
  }
}
