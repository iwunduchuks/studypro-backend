import { User } from "../domain/entities/user";
import { UserRepository } from "../domain/repositories/userRepo";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getBoss(): Promise<User | null> {
    const users = await this.userRepository.findAll();
    return users.find((user) => user.role === "admin") || null;
  }

  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user ? user.role === "admin" : false;
  }
}
