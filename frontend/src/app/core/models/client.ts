import {BaseModel} from "./base-model";
import {Address} from "./address";

export class Client extends BaseModel<Client> {
 private static _tax_numbers = new Map<string, Client>();

  name!: string;
  readonly tax_number!: string;
  phone!: string;
  email!: string;
  address!: Address;

  constructor(model: Partial<Client>) {
    super(model);
    const { tax_number } = model;
    if (tax_number && Client._tax_numbers.has(tax_number)) {
      return Client._tax_numbers.get(tax_number)!;
    }

    if(model.address)this.address = new Address(model.address);
    this.tax_number = tax_number!;
    Client._tax_numbers.set(tax_number!, this);
  }


  static get tax_numbers(): Map<string, Client> {
    return this._tax_numbers;
  }
}

export type clientInfo = Omit<Client, "name" | "Address">
export type clientAddress = Omit<Address, "longitude" | "latitude">;
