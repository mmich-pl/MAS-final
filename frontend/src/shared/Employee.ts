import {Address} from "./Address";
import {ResourceModel} from "./ResourceModel";

export abstract class Employee extends ResourceModel<Employee>{
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

const ADDITIONAL_LICENCES = {
  FLAMMABLE: "Flammable",
  TOXIC: "Toxic",
  DELICATE: "Delicate",
  LIVESTOCK: "Livestock",
  OVER_DIMENSIONAL: "Overdimensional",
} as const;

export type AdditionalLicences = keyof typeof ADDITIONAL_LICENCES;

export class Driver extends Employee  {
  static driver_extents =new Map<string, Driver>();

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

      if (!Driver.driver_extents.has(this.driver_licence.document_id))
        Driver.driver_extents.set(this.driver_licence.document_id, this);
    }
    if (model.owned_licences) {
      this.owned_licences = model.owned_licences;
    }


  }
}

