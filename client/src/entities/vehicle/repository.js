import { BaseRepository } from '../../shared/lib/base-repository';

class VehicleRepository extends BaseRepository {
  constructor() {
    super('Vehicles');
  }
}

export const vehicleRepository = new VehicleRepository();
