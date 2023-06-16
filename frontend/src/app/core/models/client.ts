import {BaseModel} from "./base-model";
import {Address} from "./address";

export class Client extends BaseModel<Client> {
  static tax_numbers = new Map<string, Client>();

  name!: string;
  tax_number!: string;
  phone!: string;
  email!: string;
  address!: Address;

  constructor(model: Partial<Client>) {
    super(model);
    if(model.address)this.address = new Address(model.address);
    if (!Client.tax_numbers.has(model.tax_number!)){
      Client.tax_numbers.set(model.tax_number!, this);
    }
  }
}

export type clientInfo = Omit<Client, "name" | "Address">
export type clientAddress = Omit<Address, "longitude" | "latitude">;
