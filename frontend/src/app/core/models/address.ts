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
    if (model.latitude) this.latitude = parseFloat(model.latitude.toFixed(3));
    if (model.longitude) this.longitude = parseFloat(model.longitude.toFixed(3));
  }
}
