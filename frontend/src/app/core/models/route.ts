import {BaseModel} from "./base-model";
import {Address} from "./address";

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

  filter(callback: (item: T, index: number, array: ReadonlyArray<T>) => boolean): T[] {
    return this._items.filter(callback);
  }
}

export class Section {
  id!: string;
  origin = new Array<number>(2);
  destination = new Array<number>(2);
  polyline = "";
  duration!: number;
  length!: number;

  private constructor() {}

  static newSection(route: Route, id: string, origin: number[], destination: number[], polyline: string, duration: number, length: number): Section {
    if (route == null) {
      throw new TypeError("route is null");
    }
    let section = new Section();
    section.id = id;
    section.origin = origin;
    section.destination = destination;
    section.polyline = polyline;
    section.duration = duration;
    section.length = length;
    route.addSection(section);
    return section
  }
}

export class Route {
  private static allSections = new Set<Section>();
  origin!: [number, number];
  destination!: [number, number];
  sections = new FixedOrderContainer<Section>();

  public static fromJSON(json: any): Route {
    const route = new Route();

    route.origin = [json.sections[0].departure.place.location.lat, json.sections[0].departure.place.location.lng];
    route.destination = [json.sections[json.sections.length - 1].arrival.place.location.lat,
      json.sections[json.sections.length - 1].arrival.place.location.lng];

    for (const section of json.sections) {
      Section.newSection(route, section.id, [section.departure.place.location.lat, section.departure.place.location.lng],
        [section.arrival.place.location.lat, section.arrival.place.location.lng],
        section.polyline, section.summary.duration, section.summary.length);
    }

    return route;
  }

  get duration(): number {
    return this.sections.map(c => c.duration).reduce((sum, current) => sum + current);
  }

  get formatted_duration(): string {
    let seconds = this.duration;
    let h = Math.floor(seconds / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    return hDisplay + mDisplay
  }

  get length(): number {
    return this.sections.map(c => c.length).reduce((sum, current) => sum + current);
  }

  get centreLat(): number {
    return (this.origin[0] + this.destination[0]) / 2;
  }

  get centreLng(): number {
    return (this.origin[1] + this.destination[1]) / 2;
  }

  findSection(address: Address, action: string): Section[] {
    let equal = (arr1: any[], arr2: any[]) => {
      return (arr1.length !== arr2.length) ? false :
        arr1.every((value, index) => value.toFixed(3) === arr2[index].toFixed(3));
    }
    return this.sections.filter(a => (action == "drop") ?
      equal(a.destination, [address.latitude, address.longitude]) :
      equal(a.origin, [address.latitude, address.longitude]))
  }

  addSection(section: Section) {
    if (!Route.allSections.has(section)){
      this.sections.push(section);
      Route.allSections.add(section);
    }
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
