import {Address} from "./address";
import {Cargo} from "./cargo";
import {Trailer, Truck} from "./truck";
import {Driver} from "./employee";
import {Section} from "./route";

export class Carriage {
  protected static TruckSet = class {
    trailer!: Trailer;
    truck!: Truck;
    load!: [Cargo, number][];
    sections!: Section[];
    driver!: Driver;
  }

  id!: string;
  pickup_time!: Date;
  pickup_address!: Address;
  drop_address!: Address;
  truck_sets!: InstanceType<typeof Carriage.TruckSet>[];
}
