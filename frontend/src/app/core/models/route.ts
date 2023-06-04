import {BaseModel} from "./base-model";

class FixedOrderContainer<T> {
  private readonly _items: Array<T>;

  constructor() {
    this._items = new Array<T>();
  }

  push(item: T): void {
    if (!this._items.includes(item)) {
      this._items.push(item);
    }
  }

  getItems(): ReadonlyArray<T> {
    return this._items;
  }

  map<U>(callback: (item: T) => U): U[] {
    return this._items.map(callback);
  }

  forEach(callback: (item: T, index: number, array: ReadonlyArray<T>) => void): void {
    this._items.forEach(callback);
  }
}

class Section {
  origin = new Array<number>(2);
  destination = new Array<number>(2);
  polyline = "";
  duration!: number;
  length!: number;

  static newSection(route: Route, origin: number[], destination: number[], polyline: string, duration: number, length: number): Section {
    if (route == null) {
      throw new TypeError("route is null");
    }
    let section = new Section();
    section.origin = origin;
    section.destination = destination;
    section.polyline = polyline;
    section.duration = duration;
    section.length = length;
    return section
  }
}

export class Route {
  origin!: [number, number];
  destination!: [number, number];
  sections = new FixedOrderContainer<Section>();

  public static fromJSON(json: any): Route {
    const route = new Route();

    route.origin = [json.sections[0].departure.place.location.lat, json.sections[0].departure.place.location.lng];
    route.destination = [json.sections[json.sections.length - 1].arrival.place.location.lat,
      json.sections[json.sections.length - 1].arrival.place.location.lng];

    for (const section of json.sections) {
      route.sections.push(Section.newSection(route, [section.departure.place.location.lat, section.departure.place.location.lng],
        [section.arrival.place.location.lat, section.arrival.place.location.lng],
        section.polyline, section.summary.duration, section.summary.length));
    }

    return route;
  }

  get duration(): number {
    return this.sections.map(c => c.duration).reduce((sum, current) => sum + current);
  }

  get length(): number {
    return this.sections.map(c => c.length).reduce((sum, current) => sum + current);
  }

  getCentreLat() : number {
    return (this.origin[0] + this.destination[0])/2;
  }

  getCentreLng() : number {
    return (this.origin[1] + this.destination[1])/2;
  }

}

export class RouteDTO extends BaseModel<RouteDTO> {
  origin!: [number, number];
  destination!: [number, number];
  departureTime!: string;
  via?: Array<[number, number]>;

  constructor(model: Partial<RouteDTO>) {
    super(model);
  }
}
