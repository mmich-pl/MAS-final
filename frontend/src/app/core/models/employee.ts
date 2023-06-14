import {Address} from "./address";
import {BaseModel} from "./base-model";

export const Genders = {
  Man: "Man",
  Woman: "Woman",
} as const;

export type GenderKey = typeof Genders[keyof typeof Genders];

export abstract class Employee extends BaseModel<Employee> {
  static ids = new Map<string, Employee>();

  readonly personal_id_number!: string;
  readonly first_name!: string;
  readonly last_name!: string;
  readonly maiden_name?: string;
  gender!: GenderKey;
  birth_date!: Date;
  readonly employment_date!: Date;
  dismissal_date?: Date;
  phone!: string;
  email!: string;
  private _salary!: number;
  address!: Address;
  private static _min_salary = 3490;

  constructor(model: Partial<Employee>) {
    super(model);
    if (!Employee.ids.has(model.personal_id_number!)){
      Employee.ids.set(model.personal_id_number!, this);
    }else {
      throw new Error ("personal identity number mus be unique");
    }
  }

  get salary(): number {
    return this._salary;
  }

  set salary(value: number) {
    if (value < this._salary) {
      throw new Error("salary cannot be lower than the minimum remuneration.");
    }
    let max_salary = this._salary + (this._salary * 0.3);

    if (value > max_salary) {
      throw new Error("salary cannot be higher than 30% of the current rate.");
    }

    this._salary = value;
  }

  static get min_salary(): number {
    return this._min_salary;
  }

  static set min_salary(value: number) {
    this._min_salary = value;
  }

  age(): number {
    let today = new Date();
    let age = today.getFullYear() - this.birth_date.getFullYear();
    const monthDiff = today.getMonth() - this.birth_date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.birth_date.getDate())) {
      age--;
    }

    return age;
  }
}

export class Forwarder extends Employee {
  previousWorkPlaces!: Array<[string, number]>;
}

export class FleetManager extends Employee {

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

export class Driver extends Employee {
  driver_licence = {
    document_id: '',
    expiration_date: new Date(),
    categories: [] as string[],
  };
  owned_licences: string[] = [];

  constructor(model: Partial<Driver>) {
    super(JSON.parse(JSON.stringify(model))["employee"]);

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

  get name(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
