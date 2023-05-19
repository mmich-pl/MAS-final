import {Address} from "./Address";
import {Cargo} from "./Cargo";
import {Trailer, Truck} from "./Truck";
import {Driver} from "./Employee";

export class Carriage {
  protected static TruckSet = class {
    trailer!: Trailer;
    truck!: Truck;
    driver!: Driver;
  }

  id!: string;
  pickup_time!: Date;
  pickup_address!: Address;
  drop_address!: Address;
  cargo!: [Cargo, number][];
  truck_sets!: InstanceType<typeof Carriage.TruckSet>[];
}
