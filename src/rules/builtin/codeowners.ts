import { addIssue, type Context, type Rule } from "../../lib/engine.js";
import { fileExists } from "../../lib/github/queries.js";
import { proposeTextFileResolution } from "../../lib/github/resolutions.js";

const rule: Rule = {
  id: "builtin/codeowners",
  fn: async (ctx: Context) => {
    if (!(await fileExists(ctx, ".github/CODEOWNERS"))) {
      await addIssue(ctx, {
        priority: 2,
        title: ".github/CODEOWNERS does not exist",

        description: `The repository does not document code ownership in a machine-readable way.`,

        remediation: `Create a \`.github/CODEOWNERS\` file in the repository to document code ownership. At a minimum, the file should specify the repository owner as the code owner for all files in the repository.`,

        proposeResolution: async (ctx, issue) => {
          await proposeTextFileResolution(ctx, issue, {
            branchName: `turma/${issue.rule.id}`,

            filePath: ".github/CODEOWNERS",
            content: `* @${ctx.repository.owner.login}\n`,
          });
        },
      });
    }
  },
};

export default rule;
