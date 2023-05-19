import {Address} from "./Address";

export class Employee {
  readonly first_name!:string;
  readonly last_name!:string;
  readonly personal_id_number!:string;
  age!:number;
  readonly employment_date!:Date;
  dismissal_date?:Date;
  phone!:string;
  email!:string;
  salary!:number;
  address!:Address;
}

export class Forwarder extends Employee{

}

const ADDITIONAL_LICENCES ={
  FLAMMABLE:"Flammable",
  TOXIC:"Toxic",
  DELICATE:"Delicate",
  LIVESTOCK:"Livestock",
  OVER_DIMENSIONAL:"Overdimensional",
} as const;

export type AdditionalLicences =  keyof typeof ADDITIONAL_LICENCES;

export class Driver extends Employee{
  driver_licence!:DriverLicence;
  additional_licences: AdditionalLicences[]|null = null;
}

export class DriverLicence {
  document_id!:string;
  expiration_date!: Date;
  categories:string[]=[];
}
