import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import jwt from "jsonwebtoken";
import type { TopicTitleLength } from "../src/application/interfaces/topicTitleGenerator.interface";
import type { Topic } from "../src/domain/entities/topic";

test("topic HTTP endpoints validate, persist, and report errors", async (t) => {
  process.env.JWT_SECRET = "test-secret-with-at-least-32-characters";
  process.env.AUTH_PASSWORD = "test-password";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

  const { PrismaTopicRepository }: typeof import("../src/infrastructure/persistence/prisma/prismaTopicRepo") =
    require("../src/infrastructure/persistence/prisma/prismaTopicRepo");
  const { ClaudeTopicTitleGenerator }: typeof import("../src/infrastructure/ai/claudeTopicTitleGenerator") =
    require("../src/infrastructure/ai/claudeTopicTitleGenerator");
  const topics = new Map<string, Topic>();
  const generated: Array<[string, string | undefined]> = [];
  let failingOperation: string | undefined;
  t.mock.method(PrismaTopicRepository.prototype, "findAll", async () => {
    if (failingOperation === "findAll") throw new Error("Find all failed");
    return [...topics.values()];
  });
  t.mock.method(PrismaTopicRepository.prototype, "findById", async (id: string) => {
    if (failingOperation === "findById") throw new Error("Find failed");
    return topics.get(id) ?? null;
  });
  t.mock.method(PrismaTopicRepository.prototype, "save", async (topic: Topic) => {
    topics.set(topic.id, topic);
    return topic;
  });
  t.mock.method(PrismaTopicRepository.prototype, "updateTitle", async (id: string, title: string) => {
    if (failingOperation === "updateTitle") throw new Error("Update failed");
    const topic = topics.get(id);
    if (!topic) return null;
    topic.title = title;
    return topic;
  });
  t.mock.method(PrismaTopicRepository.prototype, "remove", async (id: string) => {
    if (failingOperation === "remove") throw new Error("Delete failed");
    return topics.delete(id);
  });
  t.mock.method(ClaudeTopicTitleGenerator.prototype, "generate", async (content: string, length?: TopicTitleLength) => {
    generated.push([content, length]);
    if (content === "generation failure") throw new Error("Generation failed");
    return length === "short" ? "Short title" : "Long context title";
  });

  const { default: app }: typeof import("../src/app") = require("../src/app");
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}`;
  const token = jwt.sign({}, process.env.JWT_SECRET);
  const request = (path: string, method: string, body?: unknown, authenticated = true) =>
    fetch(`${url}${path}`, {
      method,
      headers: {
        ...(authenticated ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

  for (const [path, method] of [
    ["/topic", "GET"],
    ["/topic/id", "GET"],
    ["/topic", "POST"],
    ["/topic/id", "PUT"],
    ["/topic/id", "DELETE"],
  ]) {
    assert.equal((await request(path, method, undefined, false)).status, 401);
  }

  for (const body of [undefined, {}, { context: "" }, { context: "  " }, { context: 1 }]) {
    assert.equal((await request("/topic", "POST", body)).status, 400);
  }
  for (const body of [undefined, {}, { title: "" }, { title: "  " }, { title: 1 }]) {
    assert.equal((await request("/topic/missing", "PUT", body)).status, 400);
  }
  assert.deepEqual(generated, []);

  const create = await request("/topic", "POST", { context: "Learning content" });
  assert.equal(create.status, 201);
  const created = await create.json();
  assert.equal(created.success, true);
  assert.equal(created.data.title, "Short title");
  assert.equal(created.data.contexts[0].title, "Long context title");
  assert.equal(created.data.contexts[0].content, "Learning content");
  assert.deepEqual(generated, [
    ["Learning content", "short"],
    ["Learning content", "long"],
  ]);
  const id: string = created.data.id;

  const list = await request("/topic", "GET");
  assert.equal(list.status, 200);
  assert.deepEqual((await list.json()).data, [created.data]);
  const get = await request(`/topic/${id}`, "GET");
  assert.equal(get.status, 200);
  assert.deepEqual((await get.json()).data, created.data);

  const update = await request(`/topic/${id}`, "PUT", { title: "Updated" });
  assert.equal(update.status, 200);
  const updated = (await update.json()).data;
  assert.equal(updated.title, "Updated");
  assert.deepEqual(updated.contexts, created.data.contexts);

  assert.equal((await request(`/topic/${id}`, "DELETE")).status, 200);
  assert.equal((await request(`/topic/${id}`, "GET")).status, 404);
  assert.equal((await request(`/topic/${id}`, "PUT", { title: "Again" })).status, 404);
  assert.equal((await request(`/topic/${id}`, "DELETE")).status, 404);

  const failed = await request("/topic", "POST", { context: "generation failure" });
  assert.equal(failed.status, 500);
  const failure = await failed.json();
  assert.equal(failure.success, false);
  assert.equal(failure.message, "Generation failed");
  assert.deepEqual(failure.error, {});
  assert.equal(topics.size, 0);

  for (const [operation, path, method, body, message] of [
    ["findAll", "/topic", "GET", undefined, "Find all failed"],
    ["findById", "/topic/id", "GET", undefined, "Find failed"],
    ["updateTitle", "/topic/id", "PUT", { title: "Title" }, "Update failed"],
    ["remove", "/topic/id", "DELETE", undefined, "Delete failed"],
  ] as const) {
    failingOperation = operation;
    const response = await request(path, method, body);
    assert.equal(response.status, 500);
    const result = await response.json();
    assert.equal(result.success, false);
    assert.equal(result.message, message);
    assert.deepEqual(result.error, {});
  }
});
