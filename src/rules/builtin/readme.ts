import { addIssue, type Context, type Rule } from "../../lib/engine.js";
import { fileExists } from "../../lib/github/queries.js";

const rule: Rule = {
  id: "builtin/readme",
  fn: async (ctx: Context) => {
    if (!(await fileExists(ctx, "README.md"))) {
      await addIssue(ctx, {
        title: "README.md does not exist",
      });
    }
  },
};

export default rule;
