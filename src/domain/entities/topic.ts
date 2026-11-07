import { Context } from "./context";

export class Topic {
  constructor(
    public id: string,
    public title: string,
    public contexts: Context[],
  ) {}

  addContext(context: Context): void {
    this.contexts.push(context);
  }
}
