import {CargoType} from "./Cargo";
import {ResourceModel} from "./ResourceModel";

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
  REFRIGERATED: "Refrigerated",
  LIVESTOCK_TRAILER: "Livestock"
} as const;

type TrailerType = keyof typeof TRAILER_TYPES;

export class Trailer extends ResourceModel<Trailer>{
  static trailer_extent = new Map<string, Trailer>();

  plate!: string;
  axis_number!: number;
  carrying_capacity!: number;
  brand!: string;
  purchase_date?: Date;
  type!: TrailerType;
  cargo_type!: CargoType;

  constructor(model: Partial<Trailer>) {
    super(model);

    if (!Trailer.trailer_extent.has(this.plate)) {
      Trailer.trailer_extent.set(this.plate, this);
    }
  }
}

export class Service {
  id!: string;
  mileage!: number;
  expiration_date!: Date;
}
