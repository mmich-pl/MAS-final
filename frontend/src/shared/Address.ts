export class Address{
  id!:string;
  zipcode!:string;
  city!: string;
  country!:string;
  street!:string;
  constructor(id: string, zipcode: string, city: string, country: string, street: string) {
    this.id = id;
    this.zipcode = zipcode;
    this.city = city;
    this.country = country;
    this.street = street;
  }
}
