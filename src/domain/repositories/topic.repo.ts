import { Topic } from "../entities/topic";

export interface TopicRepository {
  findAll(): Promise<Topic[]>;
  findById(id: string): Promise<Topic | null>;
  save(topic: Topic): Promise<Topic>;
  updateTitle(id: string, title: string): Promise<Topic | null>;
  remove(id: string): Promise<boolean>;
}
