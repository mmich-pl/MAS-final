import {BaseModel} from "./base-model";
export class Address extends BaseModel<Address> {
  postalCode!: string;
  city!: string;
  country!: string;
  street!: string;
  state!: string;
  latitude?: number;
  longitude?: number;

  constructor(model: Partial<Address>) {
    super(model)
  }
}
