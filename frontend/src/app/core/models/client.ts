import {BaseModel} from "./base-model";
import {Address} from "./address";

export class Client extends BaseModel<Client> {
  name!: string;
  tax_number!: string;
  phone!: string;
  email!: string;
  address!: Address;

  constructor(model: Partial<Client>) {
    super(model);
  }

 static fromJSON(value: any): Client {
    return new Client(JSON.parse(JSON.stringify(value)));
  }
}

export type clientInfo = Omit<Client, "name" | "Address">
export type clientAddress = Omit<Address, "longitude" | "latitude">;
