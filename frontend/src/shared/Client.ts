export class Client {
  static clients_extent: Map<string, Client> = new Map<string, Client>();

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

    if (!Client.clients_extent.has(this.id)) {
      Client.clients_extent.set(this.name, this)
    }
  }
}

export type clientInfo = Omit<Client, "name" | "client_extent">
