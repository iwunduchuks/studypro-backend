import { randomUUID } from "node:crypto";
import { Context } from "../../domain/entities/context";
import { Topic } from "../../domain/entities/topic";
import type { TopicRepository } from "../../domain/repositories/topic.repo";
import type { TopicTitleGenerator } from "../interfaces/topicTitleGenerator.interface";

export class TopicService {
  constructor(
    private readonly topicRepository: TopicRepository,
    private readonly titleGenerator: TopicTitleGenerator,
  ) {}

  async create(content: string): Promise<Topic> {
    const [topicTitle, contextTitle] = await Promise.all([
      this.titleGenerator.generate(content, "short"),
      this.titleGenerator.generate(content, "long"),
    ]);

    const context = new Context(randomUUID(), contextTitle, content, [], []);
    const topic = new Topic(randomUUID(), topicTitle, [context]);
    return this.topicRepository.save(topic);
  }

  async updateTitle(id: string, title: string): Promise<Topic | null> {
    const topic = await this.topicRepository.findById(id);
    if (!topic) return null;

    topic.title = title;
    return this.topicRepository.save(topic);
  }
}
