import { addIssue, type Context, type Rule } from "../../lib/engine.js";
import { fileExists } from "../../lib/github/queries.js";

const rule: Rule = {
  id: "builtin/biome",
  fn: async (ctx: Context) => {
    if (!(await fileExists(ctx, "package.json"))) {
      return;
    }

    if (!(await fileExists(ctx, "biome.json"))) {
      await addIssue(ctx, {
        priority: 2,
        title: "Project is not using Biome",

        description: `Node.js projects should use Biome to lint and format the code.`,
      });

      return;
    }
  },
};

export default rule;
