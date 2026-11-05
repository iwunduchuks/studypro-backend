export const EXERCISE_DETAIL_LEVELS = ["shallow", "comprehensive"] as const;

export type ExerciseDetailLevel = (typeof EXERCISE_DETAIL_LEVELS)[number];

export class Exercise {
  constructor(
    public id: string,
    public question: string,
    public answer: string,
    public contextId: string,
    public order: string,
    public detailLevel: ExerciseDetailLevel,
  ) {}
}
