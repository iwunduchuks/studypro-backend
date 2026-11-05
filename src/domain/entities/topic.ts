import { Context } from "./context";

export class Topic {
  constructor(
    public id: string,
    public title: string,
    public contexts: Context[],
  ) {}
}
