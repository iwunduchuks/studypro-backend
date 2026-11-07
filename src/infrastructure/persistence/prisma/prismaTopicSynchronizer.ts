import { Topic } from "../../../domain/entities/topic";
import { Prisma } from "../../../../generated/prisma/client";

type Transaction = Prisma.TransactionClient;

async function ensureContextOwnership(
  transaction: Transaction,
  topic: Topic,
): Promise<void> {
  const contextIds = topic.contexts.map((context) => context.id);
  if (contextIds.length === 0) return;

  const conflicts = await transaction.context.findMany({
    where: { id: { in: contextIds }, topicId: { not: topic.id } },
    select: { id: true },
  });
  if (conflicts.length > 0) {
    throw new Error(
      `Context IDs belong to another topic: ${conflicts.map(({ id }) => id).join(", ")}`,
    );
  }
}

async function ensureChildOwnership(
  transaction: Transaction,
  topicId: string,
  childIds: string[],
  kind: "note" | "exercise",
): Promise<void> {
  if (childIds.length === 0) return;

  const conflicts =
    kind === "note"
      ? await transaction.note.findMany({
          where: {
            id: { in: childIds },
            context: { topicId: { not: topicId } },
          },
          select: { id: true },
        })
      : await transaction.exercise.findMany({
          where: {
            id: { in: childIds },
            context: { topicId: { not: topicId } },
          },
          select: { id: true },
        });
  if (conflicts.length > 0) {
    throw new Error(
      `${kind} IDs belong to another topic: ${conflicts.map(({ id }) => id).join(", ")}`,
    );
  }
}

export async function synchronizeContexts(
  transaction: Transaction,
  topic: Topic,
): Promise<void> {
  await ensureContextOwnership(transaction, topic);

  const existingContexts = await transaction.context.findMany({
    where: { topicId: topic.id },
  });
  const existingById = new Map(
    existingContexts.map((context) => [context.id, context]),
  );
  const currentIds = new Set(topic.contexts.map((context) => context.id));
  const removedIds = existingContexts
    .map((context) => context.id)
    .filter((id) => !currentIds.has(id));

  if (removedIds.length > 0) {
    await transaction.exercise.deleteMany({
      where: { contextId: { in: removedIds } },
    });
    await transaction.note.deleteMany({
      where: { contextId: { in: removedIds } },
    });
    await transaction.context.deleteMany({
      where: { id: { in: removedIds }, topicId: topic.id },
    });
  }

  for (const context of topic.contexts) {
    const existing = existingById.get(context.id);
    if (!existing) {
      await transaction.context.create({
        data: {
          id: context.id,
          title: context.title,
          content: context.content,
          topicId: topic.id,
        },
      });
    } else if (
      existing.title !== context.title ||
      existing.content !== context.content
    ) {
      await transaction.context.update({
        where: { id: context.id },
        data: { title: context.title, content: context.content },
      });
    }
  }
}

export async function synchronizeNotes(
  transaction: Transaction,
  topic: Topic,
): Promise<void> {
  const notes = topic.contexts.flatMap((context) =>
    context.notes.map((note) => ({ contextId: context.id, note })),
  );
  await ensureChildOwnership(
    transaction,
    topic.id,
    notes.map(({ note }) => note.id),
    "note",
  );

  const existingNotes = await transaction.note.findMany({
    where: { context: { topicId: topic.id } },
  });
  const existingById = new Map(
    existingNotes.map((note) => [note.id, note]),
  );
  const currentIds = new Set(notes.map(({ note }) => note.id));
  const removedIds = existingNotes
    .map((note) => note.id)
    .filter((id) => !currentIds.has(id));

  if (removedIds.length > 0) {
    await transaction.note.deleteMany({
      where: { id: { in: removedIds } },
    });
  }

  for (const { contextId, note } of notes) {
    const existing = existingById.get(note.id);
    if (!existing) {
      await transaction.note.create({
        data: {
          id: note.id,
          contextId,
          content: note.content,
          order: note.order,
          detailLevel: note.detailLevel,
        },
      });
    } else {
      const changedFields = {
        ...(existing.contextId !== contextId ? { contextId } : {}),
        ...(existing.content !== note.content ? { content: note.content } : {}),
        ...(existing.order !== note.order ? { order: note.order } : {}),
        ...(existing.detailLevel !== note.detailLevel
          ? { detailLevel: note.detailLevel }
          : {}),
      };

      if (Object.keys(changedFields).length > 0) {
        await transaction.note.update({
          where: { id: note.id },
          data: changedFields,
        });
      }
    }
  }
}

export async function synchronizeExercises(
  transaction: Transaction,
  topic: Topic,
): Promise<void> {
  const exercises = topic.contexts.flatMap((context) =>
    context.exercises.map((exercise) => ({
      contextId: context.id,
      exercise,
    })),
  );
  await ensureChildOwnership(
    transaction,
    topic.id,
    exercises.map(({ exercise }) => exercise.id),
    "exercise",
  );

  const existingExercises = await transaction.exercise.findMany({
    where: { context: { topicId: topic.id } },
  });
  const existingById = new Map(
    existingExercises.map((exercise) => [exercise.id, exercise]),
  );
  const currentIds = new Set(
    exercises.map(({ exercise }) => exercise.id),
  );
  const removedIds = existingExercises
    .map((exercise) => exercise.id)
    .filter((id) => !currentIds.has(id));

  if (removedIds.length > 0) {
    await transaction.exercise.deleteMany({
      where: { id: { in: removedIds } },
    });
  }

  for (const { contextId, exercise } of exercises) {
    const existing = existingById.get(exercise.id);
    if (!existing) {
      await transaction.exercise.create({
        data: {
          id: exercise.id,
          contextId,
          question: exercise.question,
          answer: exercise.answer,
          order: exercise.order,
          detailLevel: exercise.detailLevel,
        },
      });
    } else {
      const changedFields = {
        ...(existing.contextId !== contextId ? { contextId } : {}),
        ...(existing.question !== exercise.question
          ? { question: exercise.question }
          : {}),
        ...(existing.answer !== exercise.answer
          ? { answer: exercise.answer }
          : {}),
        ...(existing.order !== exercise.order ? { order: exercise.order } : {}),
        ...(existing.detailLevel !== exercise.detailLevel
          ? { detailLevel: exercise.detailLevel }
          : {}),
      };

      if (Object.keys(changedFields).length > 0) {
        await transaction.exercise.update({
          where: { id: exercise.id },
          data: changedFields,
        });
      }
    }
  }
}
