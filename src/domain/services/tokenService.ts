export interface TokenService {
  sign(): string;
  verify(token: string): boolean;
}
