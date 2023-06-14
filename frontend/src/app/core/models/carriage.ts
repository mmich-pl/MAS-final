import {Address} from "./address";
import {Cargo} from "./cargo";
import {Trailer, Truck} from "./truck";
import {Driver} from "./employee";
import {Route, Section} from "./route";
import {BaseModel} from "./base-model";
import {set} from "../../home/components/sites/set-selection/set-selection.component";
import {Client} from "./client";

class TruckSet {
  trailer!: Trailer;
  truck!: Truck;
  load!: [Cargo, number];
  sections!: string[];
  driver!: Driver;

  static newTruckSet(carriage: Carriage, trailer: Trailer, truck: Truck, load: [Cargo, number], sections: string[], driver: Driver) {
    if (carriage == null) {
      throw new TypeError("carriage is null");
    }

    let set = new TruckSet();
    set.trailer = trailer;
    set.truck = truck;
    set.load = load;
    set.sections = sections;
    set.driver = driver;
    return set;
  }
}

export class Carriage extends BaseModel<Carriage> {
  private static allTruckSets = new Set<TruckSet>();
  client!: Client;
  pickup_time!: Date;
  drop_time!: Date;
  private _pickup_address!: Address;
  private _drop_address!: Address;
  all_stops = new Array<Address>();
  truck_sets = new Array<TruckSet>();

  constructor(model: Partial<Carriage>) {
    super(model);
    if (model.pickup_address) {
      this._pickup_address = model.pickup_address;
    }
    if (model.drop_address) {
      this._drop_address = model.drop_address;
    }
    this.all_stops.push(this.pickup_address);
    this.all_stops.push(this.drop_address);
  }

  add_sets(sets_data: Array<set>, sections: string[][]) {
    let i = 0;
    sets_data.forEach(s => {
      let ts = TruckSet.newTruckSet(this, s.trailer!, s.truck!,
        [s.cargo!, s.amount!], sections[i], s.driver!);
      i++;
      if (!this.truck_sets.includes(ts)) {
        if (Carriage.allTruckSets.has(ts)) throw new Error("truck set already assigned to carriage");
        this.truck_sets.push(ts);
      }
      this.addStop(s.drop_address!);
    })
  }

  addStop(address: Address) {
    if (!this.all_stops.includes(address)) this.all_stops.push(address);
  }

  set pickup_address(address: Address) {
    if (!address) throw new Error("address can not be null");
    if (!this.all_stops.includes(address)) throw new Error("new pickup address must be par of route");
    this._pickup_address = address;
  }

  get pickup_address(): Address {
    return this._pickup_address;
  }

  set drop_address(address: Address) {
    if (!address) throw new Error("address can not be null");
    if (!this.all_stops.includes(address)) throw new Error("new pickup address must be par of route");
    this._drop_address = address;
  }

  get drop_address(): Address {
    return this._drop_address;
  }
}
