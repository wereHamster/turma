import { addIssue, type Context, type Rule } from "../../lib/engine.js";
import { fileExists } from "../../lib/github/queries.js";

const rule: Rule = {
  id: "builtin/readme",
  fn: async (ctx: Context) => {
    if (!(await fileExists(ctx, "README.md"))) {
      await addIssue(ctx, {
        priority: 2,
        title: "README.md does not exist",

        description: `The repository does not contain a \`README.md\` file in its root directory.`,

        remediation: `Create a \`README.md\` file in the root directory of the repository to provide an overview of the project, instructions for setup and usage, and any other relevant information for users and contributors.`,
      });
    }
  },
};

export default rule;
