import { User } from "../entities/user";

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  remove(id: string): Promise<void>;
}
