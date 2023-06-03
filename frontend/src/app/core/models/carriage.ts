import {Address} from "./address";
import {Cargo} from "./cargo";
import {Trailer, Truck} from "./truck";
import {Driver} from "./employee";

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
  load!: [Cargo, number][];
  truck_sets!: InstanceType<typeof Carriage.TruckSet>[];
}
