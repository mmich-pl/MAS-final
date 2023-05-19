import {CargoType} from "./Cargo";

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

export class Trailer {
  plate!: string;
  axis_number!: number;
  carrying_capacity!: number;
  brand!: string;
  purchase_date?: Date;
  type!: TrailerType;
  cargo_type!: CargoType;
}

export class Service {
  id!: string;
  mileage!: number;
  expiration_date!: Date;
}
