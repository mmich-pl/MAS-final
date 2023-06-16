export abstract class BaseModel<T> {
  protected constructor(model?: Partial<T>) {
    if (model) {
      Object.assign(this, model)
    }
  }

  static fromJSON<T>(json: any, classType: { new(model: Partial<T>): T }): T {
    const instance = new classType({});

    for (const key in instance) {
      if (json.hasOwnProperty(key)) {
        instance[key] = json[key];
      } else if (Object.getOwnPropertyDescriptor(instance, key)?.get?.length === 0) {
        throw new Error(`Required field '${key}' is missing in the JSON.`);
      }
    }

    return instance;
  }

  public toJSON(): any {
    return JSON.parse(JSON.stringify(this.toPartial()));
  }

  public toPartial<T extends this>(): Partial<T> {
    const partial: Partial<T> = {};
    (Object.keys(this) as Array<keyof T>).forEach((key) => {
      if (typeof ((this as T)[key]) === "object") {
        let val = (this as T)[key];
        partial[key] = (val instanceof BaseModel<T>) ? val.toPartial() as typeof val : val;
      }
      if (key !== "id") partial[key] = (this as T)[key];
    });

    return partial;
  }
}
