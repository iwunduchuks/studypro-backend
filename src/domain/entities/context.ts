import { Exercise } from "./exercise";
import { Note } from "./note";

export class Context {
  constructor(
    public id: string,
    public title: string,
    public content: string,
    public notes: Note[],
    public exercises: Exercise[],
  ) {}
}
