import { Command } from "commander";
import { init } from "./commands/init.js";

const program = new Command();

program
  .name("workbench")
  .description("Set up Workbench — open-source BullMQ dashboard — in seconds.")
  .version("0.1.0");

program
  .command("init", { isDefault: true })
  .description("Set up Workbench in the current project")
  .option("--cwd <path>", "Project directory", process.cwd())
  .option("--mount <path>", "Mount path for the dashboard", "/jobs")
  .option("--no-auth", "Skip basic auth setup")
  .option("--no-docker", "Skip docker-compose Redis setup")
  .option("--yes", "Skip all prompts, use defaults")
  .action(async (opts) => {
    await init(opts);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
