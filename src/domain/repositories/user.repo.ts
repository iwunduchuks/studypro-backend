import { User } from "../entities/user";

export interface UserRepository {
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  remove(id: string): Promise<void>;
}
