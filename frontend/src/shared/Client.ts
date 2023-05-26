import {ResourceModel} from "./ResourceModel";

export class Client extends ResourceModel<Client>{
  static clients_extent: Map<string, Client> = new Map<string, Client>();

  name!: string;
  tax_number!: string;
  phone!: string;
  email!: string;

  constructor(model: Partial<Client>) {
    super(model);

    if (!Client.clients_extent.has(this.name)) {
      Client.clients_extent.set(this.name, this)
    }
  }
}

export type clientInfo = Omit<Client, "name" | "client_extent">
