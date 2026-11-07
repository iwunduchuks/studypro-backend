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

  async findAll(): Promise<Topic[]> {
    return this.topicRepository.findAll();
  }

  async findById(id: string): Promise<Topic | null> {
    return this.topicRepository.findById(id);
  }

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
    return this.topicRepository.updateTitle(id, title);
  }

  async remove(id: string): Promise<boolean> {
    return this.topicRepository.remove(id);
  }
}
