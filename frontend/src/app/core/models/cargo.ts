import {Trailer} from "./truck";
import {Licences, LicencesKey} from "./employee";
import {BaseModel} from "./base-model";


const CargoTypes = {
  Grain: "Grain",
  BulkDry: "Dry Bulk Cargo",
  BulkLiquid: "Liquid Bulk Cargo",
  BuildingsMaterials: "Building Materials",
  Machines: "Machines",
  Wood: "Wood",
  Livestock: "Livestock",
  Pallet: "Pallets",
  Refrigerated: "Refrigerated",
} as const;

export type CargoTypeKey = typeof CargoTypes[keyof typeof CargoTypes];

export class CargoType {
  static cargoTypes = new Array<CargoType>();

  type: CargoTypeKey;
  private _cargo = new Map<String, Cargo>();
  private _trailers = new Array<Trailer>();

  constructor(type: CargoTypeKey) {
    this.type = type;
    if (!CargoType.cargoTypes.some((t) => t.type === type)) {
      CargoType.cargoTypes.push(this);
    }
  }

  static getOrCreate(type: CargoTypeKey): CargoType {
    let exist = CargoType.cargoTypes.find((t) => t.type == type);
    return (exist) ? exist : new CargoType(type);
  }

  addCargo(name: string, cargo: Cargo) {
    if (!this._cargo.has(name)) this._cargo.set(name, cargo);
  }

  addTrailer(trailer: Trailer) {
    if (!this._trailers.includes(trailer)) this._trailers.push(trailer)
  }

  getTrailers(): Array<Trailer> {
    return this._trailers;
  }

  mapCargoNameToType(cargo_name: string): CargoType | null | undefined {
    return this._cargo.get(cargo_name)?.type;
  }
}


export class Cargo extends BaseModel<Cargo> {
  name!: string;
  unit!: string;
  required_licence!: LicencesKey;
  type_name!: CargoTypeKey;
  type!: CargoType;

  constructor(model: Partial<Cargo>) {
    super(model);
    if (model.type_name != undefined) {
      this.type = CargoType.getOrCreate(model.type_name);
      this.type.addCargo(this.name, this);
    }

    this.required_licence = (model.required_licence) ? model.required_licence : Licences.NotRequired;
    console.log(this);
  }
}
