import assert from "node:assert/strict";
import { test } from "node:test";
import { PrismaTopicRepository } from "../src/infrastructure/persistence/prisma/prismaTopicRepo";

test("title update changes only the topic title and returns the complete topic", async () => {
  const calls: unknown[] = [];
  const record = {
    id: "topic",
    title: "New title",
    contexts: [{ id: "context", title: "Context", content: "Content", notes: [], exercises: [] }],
  };
  const transaction = {
    topic: {
      updateMany: async (args: unknown) => { calls.push(args); return { count: 1 }; },
      findUnique: async (args: unknown) => { calls.push(args); return record; },
    },
  };
  const repository = {
    client: { $transaction: async (operation: (tx: typeof transaction) => Promise<unknown>) => operation(transaction) },
  };

  const result = await Reflect.apply(PrismaTopicRepository.prototype.updateTitle, repository, ["topic", "New title"]);
  assert.ok(result);
  assert.equal(result.id, record.id);
  assert.equal(result.title, record.title);
  assert.equal(result.contexts[0].content, record.contexts[0].content);
  assert.deepEqual(result.contexts[0].notes, []);
  assert.deepEqual(result.contexts[0].exercises, []);
  assert.deepEqual(calls[0], { where: { id: "topic" }, data: { title: "New title" } });
  assert.equal(calls.length, 2);
});

test("title update returns null for a missing topic", async () => {
  const transaction = { topic: { updateMany: async () => ({ count: 0 }) } };
  const repository = {
    client: { $transaction: async (operation: (tx: typeof transaction) => Promise<unknown>) => operation(transaction) },
  };
  assert.equal(
    await Reflect.apply(PrismaTopicRepository.prototype.updateTitle, repository, ["missing", "Title"]),
    null,
  );
});

test("delete removes children before the topic and reports whether it existed", async () => {
  for (const count of [0, 1]) {
    const calls: string[] = [];
    const transaction = {
      exercise: { deleteMany: async () => { calls.push("exercise"); } },
      note: { deleteMany: async () => { calls.push("note"); } },
      context: { deleteMany: async () => { calls.push("context"); } },
      topic: { deleteMany: async () => { calls.push("topic"); return { count }; } },
    };
    const repository = {
      client: { $transaction: async (operation: (tx: typeof transaction) => Promise<unknown>) => operation(transaction) },
    };
    const result = await Reflect.apply(PrismaTopicRepository.prototype.remove, repository, ["topic"]);
    assert.equal(result, count === 1);
    assert.deepEqual(calls, ["exercise", "note", "context", "topic"]);
  }
});
