import {Address} from "./address";
import {BaseModel} from "./base-model";

export abstract class Employee extends BaseModel<Employee>{
  readonly first_name!: string;
  readonly last_name!: string;
  readonly personal_id_number!: string;
  age!: number;
  readonly employment_date!: Date;
  dismissal_date?: Date;
  phone!: string;
  email!: string;
  salary!: number;
  address!: Address;


  constructor(model: Partial<Employee>) {
    super(model);
  }
}

export class Forwarder extends Employee {

}

export const Licences = {
  Flammable: "Flammable",
  Toxic: "Toxic",
  Delicate: "Delicate",
  Livestock: "Livestock",
  OverDimensional: "Overdimensional",
  NotRequired: "Not Required"
} as const;

export type LicencesKey = typeof Licences[keyof typeof Licences];

export class Driver extends Employee  {
  driver_licence = {
    document_id: '',
    expiration_date: new Date(),
    categories: [] as string[],
  };
  owned_licences: string[] = [];

  constructor(model: Partial<Driver> ) {
    super(model);

    if (model.driver_licence) {
      this.driver_licence = {
        document_id: model.driver_licence.document_id || '',
        expiration_date: model.driver_licence.expiration_date ? new Date(model.driver_licence.expiration_date) : new Date(),
        categories: model.driver_licence.categories || [],
      };
    }
    if (model.owned_licences) {
      this.owned_licences = model.owned_licences;
    }


  }
}
