import { addIssue, type Context, type Rule } from "../../lib/engine.js";
import { fileExists } from "../../lib/github/queries.js";

const rule: Rule = {
  id: "builtin/direnv",
  fn: async (ctx: Context) => {
    if (!(await fileExists(ctx, "package.json"))) {
      return;
    }

    if (!(await fileExists(ctx, ".envrc"))) {
      await addIssue(ctx, {
        priority: 2,
        title: "Project is not using direnv",

        description: `Projects should use direnv to initialize the development shell.`,
      });

      return;
    }
  },
};

export default rule;
