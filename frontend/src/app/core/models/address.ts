import {BaseModel} from "./base-model";

export class Address extends BaseModel<Address> {
  static addresses = new Array<Address>();

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
    if (!Address.addresses.includes(this)) Address.addresses.push(this);
  }

  static fromCoordinates(lat: number, lng: number) {
    console.log(lat, lng);
    console.log(Address.addresses);
    let a = Address.addresses.find(a => a.latitude == lat && a.longitude == lng);
    console.log(a);
    return a;

  }

  get formatted(): string {
    return `${this.street}, ${this.postalCode} ${this.city}, ${this.country}`;
  }
}
