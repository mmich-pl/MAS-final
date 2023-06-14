import {BaseModel} from "./base-model";
import {CargoType, CargoTypeKey} from "./cargo";

export class Truck extends BaseModel<Truck>{
  static alreadyReservedPlates = new Map<string, Truck>();

  readonly plate!: string;
  axis_number!: number;
  mileage!: number;
  brand!: string;
  purchase_date?: Date;
  constructor(model: Partial<Truck>) {
    super(model);

    if (Trailer.alreadyReservedPlates.has(model.plate!) || Truck.alreadyReservedPlates.has(model.plate!) ) {
      throw new Error("plate is not unique");
    } else {
      Truck.alreadyReservedPlates.set(model.plate!, this);
    }
  }

  override toJSON(): any {
    console.log("truck");
    return super.toJSON();
  }
}

const TRAILER_TYPES = {
  CURTAINSIDER: "Curtainsider",
  FLATBED: "Flatbed",
  LOGGER: "Logger",
  TANK: "Tank",
  DRY_FREIGHTER: "Dry Freighter",
  SILO: "Silo",
  Refrigerated: "Refrigerated",
  LIVESTOCK_TRAILER: "Livestock"
} as const;

type TrailerType = keyof typeof TRAILER_TYPES;

export class Trailer extends BaseModel<Trailer> {
  static alreadyReservedPlates = new Map<string, Trailer>();

  readonly plate!: string;
  axis_number!: number;
  carrying_capacity!: number;
  brand!: string;
  purchase_date?: Date;
  type!: TrailerType;
  cargo_type_name!: Array<CargoTypeKey>;
  cargo_type: Array<CargoType> = new Array<CargoType>();

  static arrayFromJSON(json: any): Trailer[] {
    let res = new Array<Trailer>();
    let obj = JSON.parse(JSON.stringify(json))
    Object.keys(obj).forEach(key => {
      obj[key].forEach((d: Partial<Trailer>) => {
        let trailer = new Trailer(d);
        let type: CargoType | null = null;

        for (let t of CargoType.cargoTypes) {
          let mapped = t.mapCargoNameToType(key);
          if (mapped != null) {
            type = mapped;
            break;
          }
        }
        type?.addTrailer(trailer);
        res.push(trailer)
      })
    })
    return res;
  }

  constructor(model: Partial<Trailer>) {
    super(model);

    if (Trailer.alreadyReservedPlates.has(model.plate!) || Truck.alreadyReservedPlates.has(model.plate!) ) {
      throw new Error("plate is not unique");
    } else {
      Trailer.alreadyReservedPlates.set(model.plate!, this);
    }

    if (model.cargo_type_name != undefined && model.cargo_type_name!.length > 0) {
      model.cargo_type_name!.forEach((t) => {
        const cargoType = CargoType.getOrCreate(t);
        cargoType.addTrailer(this);
        this.cargo_type.push(cargoType);
      });
    }
  }
}
