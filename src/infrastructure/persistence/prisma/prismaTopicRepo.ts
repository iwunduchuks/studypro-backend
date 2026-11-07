import { Topic } from "../../../domain/entities/topic";
import type { TopicRepository } from "../../../domain/repositories/topic.repo";
import type { PrismaClient } from "../../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import {
  synchronizeContexts,
  synchronizeExercises,
  synchronizeNotes,
} from "./prismaTopicSynchronizer";
import { toDomain, topicWithContexts } from "./prismaTopicMapper";

export class PrismaTopicRepository implements TopicRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async findAll(): Promise<Topic[]> {
    const topics = await this.client.topic.findMany({
      include: topicWithContexts,
    });
    return topics.map(toDomain);
  }

  async findById(id: string): Promise<Topic | null> {
    const topic = await this.client.topic.findUnique({
      where: { id },
      include: topicWithContexts,
    });
    return topic ? toDomain(topic) : null;
  }

  async save(topic: Topic): Promise<Topic> {
    return this.client.$transaction(async (transaction) => {
      await transaction.topic.upsert({
        where: { id: topic.id },
        create: { id: topic.id, title: topic.title },
        update: { title: topic.title },
      });

      await synchronizeContexts(transaction, topic);
      await synchronizeNotes(transaction, topic);
      await synchronizeExercises(transaction, topic);

      const savedTopic = await transaction.topic.findUnique({
        where: { id: topic.id },
        include: topicWithContexts,
      });
      if (!savedTopic) {
        throw new Error(`Topic ${topic.id} was not found after saving`);
      }

      return toDomain(savedTopic);
    });
  }

  async remove(id: string): Promise<boolean> {
    return this.client.$transaction(async (transaction) => {
      await transaction.exercise.deleteMany({
        where: { context: { topicId: id } },
      });
      await transaction.note.deleteMany({
        where: { context: { topicId: id } },
      });
      await transaction.context.deleteMany({
        where: { topicId: id },
      });
      const result = await transaction.topic.deleteMany({ where: { id } });
      return result.count > 0;
    });
  }
}
