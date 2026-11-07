import { query } from "@anthropic-ai/claude-agent-sdk";
import type {
  TopicTitleGenerator,
  TopicTitleLength,
} from "../../application/interfaces/topicTitleGenerator.interface";

const SYSTEM_PROMPT = `You are a topic title generator.

Generate one concise, clear title that captures the main subject of the provided learning context.
Use only information from the context. Do not explain your choice or add facts.
Return only the title, with no quotation marks, preamble, or closing remarks.
Do not use any tools.`;

export class ClaudeTopicTitleGenerator implements TopicTitleGenerator {
  async generate(
    context: string,
    length: TopicTitleLength = "long",
  ): Promise<string> {
    let title: string | undefined;

    for await (const message of query({
      prompt: `${length === "short"
        ? "Generate a brief topic title of 2 to 5 words, using only the core subject, for this learning context:"
        : "Generate a topic title for this learning context:"}\n\n${context}`,
      options: {
        allowedTools: [],
        model: "claude-sonnet-4-6",
        systemPrompt: SYSTEM_PROMPT,
      },
    })) {
      if (message.type === "result" && message.subtype === "success") {
        title = message.result.trim();
      } else if (message.type === "result") {
        throw new Error(`Topic title generation failed: ${message.subtype}`);
      }
    }

    if (!title) {
      throw new Error("Claude returned an empty topic title");
    }

    return title;
  }
}
