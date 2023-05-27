import {ResourceModel} from "./ResourceModel";

class Section {
  origin = new Array<number>(2);
  destination = new Array<number>(2);
  polyline = ""
}

export class Route {
  origin!: [number, number];
  destination!: [number, number];
  sections!: Section[];


  public static fromJSON(json: any): Route {
    const route = new Route();

    route.origin = [json.origin.lat, json.origin.lng];
    route.destination = [json.destination.lat, json.destination.lng];

    for (const section of json.sections) {
      const newSection = new Section();

      newSection.origin = [section.departure.place.location.lat, section.departure.place.location.lng];
      newSection.destination = [section.arrival.place.location.lat, section.arrival.place.location.lng];
      newSection.polyline = section.polyline;

      route.sections.push(newSection);
    }

    return route;
  }

}

export class RouteDTO extends ResourceModel<Route> {
  origin!: [number, number];
  destination!: [number, number];
  departureTime!: string;
  via?: Array<[number, number]>;
  height?: number;
  grossWeight?: number;


  constructor(model: Partial<Route>) {
    super(model);
  }
}
