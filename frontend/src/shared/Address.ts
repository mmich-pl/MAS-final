import {ResourceModel} from "./ResourceModel";

export class Address extends ResourceModel<Address>{
  static address_extent: Map<string, Address> = new Map<string, Address>();

  zipcode!:string;
  city!: string;
  country!:string;
  street!:string;
  latitude?:number;
  longitude?:number;

  constructor(model: Partial<Address>) {
    super(model)

    if (!Address.address_extent.has(this.id)) {
      Address.address_extent.set(this.id, this)
    }
  }
}
