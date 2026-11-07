import { Context } from "../../../domain/entities/context";
import { Exercise } from "../../../domain/entities/exercise";
import { Note } from "../../../domain/entities/note";
import { Topic } from "../../../domain/entities/topic";
import { Prisma } from "../../../../generated/prisma/client";

export const topicWithContexts = {
  contexts: {
    include: {
      notes: true,
      exercises: true,
    },
  },
} satisfies Prisma.TopicInclude;

export type TopicRecord = Prisma.TopicGetPayload<{
  include: typeof topicWithContexts;
}>;

export function toDomain(topic: TopicRecord): Topic {
  return new Topic(
    topic.id,
    topic.title,
    topic.contexts.map(
      (context) =>
        new Context(
          context.id,
          context.title,
          context.content,
          context.notes.map(
            (note) =>
              new Note(
                note.id,
                note.content,
                note.contextId,
                note.order,
                note.detailLevel,
              ),
          ),
          context.exercises.map(
            (exercise) =>
              new Exercise(
                exercise.id,
                exercise.question,
                exercise.answer,
                exercise.contextId,
                exercise.order,
                exercise.detailLevel,
              ),
          ),
        ),
    ),
  );
}
