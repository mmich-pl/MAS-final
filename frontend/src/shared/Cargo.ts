import {AdditionalLicences} from "./Employee";

const CARGO_TYPES = {
  GRAIN: "Grain",
  BULK_DRY:"Dry Bulk Cargo",
  BULK_LIQUID: "Liquid Bulk Cargo",
  BUILDINGS_MATERIALS: "Building Materials",
  MACHINES: "Machines",
  WOOD: "Wood",
  LIVESTOCK: "Livestock",
  PALLET:"Pallets",
  REFRIGERATED:"Refrigerated",
} as const;

export type CargoType = keyof typeof CARGO_TYPES;

export class Cargo {
id!:string;
name!:string;
type!: CargoType;
unit!:string;
required_licences:AdditionalLicences[]|null=null;
}
