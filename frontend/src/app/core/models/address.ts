import {BaseModel} from "./base-model";

export class Address extends BaseModel<Address> {
  postalCode!: string;
  city!: string;
  country!: string;
  street!: string;
  state!: string;
  latitude?: number;
  longitude?: number;

  static fromJson(json: any): Address {
    let address: Address = new Address({});
    address.postalCode = json.postalCode;
    address.city = json.city;
    address.country = json.country;
    address.street = json.street;
    address.state = json.state;
    return address;
  }

  constructor(model: Partial<Address>) {
    super(model)
  }
}
