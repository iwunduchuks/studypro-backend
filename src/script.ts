import "dotenv/config";
import { ClaudeTopicTitleGenerator } from "./infrastructure/ai/claudeTopicTitleGenerator";

async function main(): Promise<void> {
  const context = process.argv.slice(2).join(" ").trim() ||
    "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.";

  const generator = new ClaudeTopicTitleGenerator();
  const title = await generator.generate(context);
  console.log("Generated topic title:", title);
}

main().catch((error: unknown) => {
  console.error("Failed to generate topic title:", error);
  process.exitCode = 1;
});