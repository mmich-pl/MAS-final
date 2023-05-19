export class Client {
  id!: string;
  name!: string;
  tax_number!: string;
  phone!: string;
  email!: string;

  constructor(id: string, name: string, tax_number: string, phone: string, email: string) {
    this.id = id;
    this.name = name;
    this.tax_number = tax_number;
    this.phone = phone;
    this.email = email;
  }
}
