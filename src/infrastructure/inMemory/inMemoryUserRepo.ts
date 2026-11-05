import { User } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repositories/userRepo";

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [
    new User("1", "John Doe", "user"),
    new User("2", "Iwundu Chukwudi", "admin"),
  ];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async save(user: User): Promise<User> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }
}
