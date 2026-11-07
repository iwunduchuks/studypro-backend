import { Topic } from "../entities/topic";

export interface TopicRepository {
  findAll(): Promise<Topic[]>;
  findById(id: string): Promise<Topic | null>;
  save(topic: Topic): Promise<Topic>;
  remove(id: string): Promise<boolean>;
}
