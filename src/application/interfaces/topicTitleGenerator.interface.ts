export type TopicTitleLength = "short" | "long";

export interface TopicTitleGenerator {
  generate(context: string, length?: TopicTitleLength): Promise<string>;
}
