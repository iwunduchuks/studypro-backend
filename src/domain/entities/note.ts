export const NOTE_DETAIL_LEVELS = ["overview", "studyGuide", "detailed"] as const;

export type NoteDetailLevel = (typeof NOTE_DETAIL_LEVELS)[number];

export class Note {
  constructor(
    public id: string,
    public content: string,
    public contextId: string,
    public order: number,
    public detailLevel: NoteDetailLevel,
  ) {}
}
