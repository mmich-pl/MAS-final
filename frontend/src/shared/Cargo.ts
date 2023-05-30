import {AdditionalLicences} from "./Employee";
import {ResourceModel} from "./ResourceModel";
import {Trailer} from "./Truck";

const CARGO_TYPES = {
  GRAIN: "Grain",
  BULK_DRY: "Dry Bulk Cargo",
  BULK_LIQUID: "Liquid Bulk Cargo",
  BUILDINGS_MATERIALS: "Building Materials",
  MACHINES: "Machines",
  WOOD: "Wood",
  LIVESTOCK: "Livestock",
  PALLET: "Pallets",
  REFRIGERATED: "Refrigerated",
} as const;

export type CargoTypeNames = keyof typeof CARGO_TYPES;

export class CargoType {
  static cargoTypes = new Array<CargoType>();

  type: CargoTypeNames;
  private _cargo = new Array<Cargo>();
  private _trailers = new Array<Trailer>();

  constructor(type: CargoTypeNames) {
    this.type = type;
    if (!CargoType.cargoTypes.some((t) => t.type === type)) {
      CargoType.cargoTypes.push(this);
    }
  }

  static getOrCreate(type: CargoTypeNames): CargoType {
    let exist = CargoType.cargoTypes.find((t) => t.type == type);
    if (exist) {
      return exist
    }
    return new CargoType(type)
  }

  addCargo(cargo: Cargo) {
    this._cargo.push(cargo)
  }
  addTrailer(trailer:Trailer) {
    this._trailers.push(trailer)
  }

  getTrailers(): Array<Trailer> {
    return this._trailers;
  }
}


export class Cargo extends ResourceModel<Cargo> {
  static cargo_extent = new Map<string, Cargo>();
  name!: string;
  unit!: string;
  required_licences?: AdditionalLicences[];
  type_name!: CargoTypeNames;
  type: CargoType | null;

  constructor(model: Partial<Cargo>) {
    super(model);

    this.type = (model.type_name != undefined) ?
      CargoType.getOrCreate(model.type_name) : null;
    this.type?.addCargo(this);

    if (!Cargo.cargo_extent.has(this.name)) {
      Cargo.cargo_extent.set(this.name, this);
    }
  }
}
