export abstract class BaseModel<T> {
  public id?:any;

  protected constructor(model?:Partial<T>) {
    if (model) {
      Object.assign(this, model)
    }
  }

  public toJson():any {
    return JSON.parse(JSON.stringify(this))
  }
}
