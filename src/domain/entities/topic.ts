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

  removeContext(id: string): boolean {
    const index = this.contexts.findIndex((context) => context.id === id);
    if (index === -1) return false;

    this.contexts.splice(index, 1);
    return true;
  }
}
