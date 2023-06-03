import {BaseModel} from "./base-model";
import {CargoType, CargoTypeKey} from "./cargo";

export class Truck {
  plate!: string;
  axis_number!: number;
  mileage!: number;
  brand!: string;
  purchase_date?: Date;
}

const TRAILER_TYPES = {
  CURTAINSIDER: "Curtainsider",
  FLATBED: "Flatbed",
  LOGGER: "Logger",
  TANK: "Tank",
  DRY_FREIGHTER: "Freighter",
  SILO: "Silo",
  Refrigerated: "Refrigerated",
  LIVESTOCK_TRAILER: "Livestock"
} as const;

type TrailerType = keyof typeof TRAILER_TYPES;

export class Trailer extends BaseModel<Trailer> {


  plate!: string;
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
    console.log(res);
    return res;
  }

  constructor(model: Partial<Trailer>) {
    super(model);
    if (model.cargo_type_name != undefined && model.cargo_type_name!.length > 0) {
      model.cargo_type_name!.forEach((t) => {
        const cargoType = CargoType.getOrCreate(t);
        console.log(cargoType);
        cargoType.addTrailer(this);
        this.cargo_type.push(cargoType);
      });
    }


  }
}
