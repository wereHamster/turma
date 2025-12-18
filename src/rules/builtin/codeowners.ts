import { addIssue, type Context, type Rule } from "../../lib/engine.js";
import { fileExists } from "../../lib/github/queries.js";
import { proposeTextFileResolution } from "../../lib/github/resolutions.js";

const rule: Rule = {
  id: "builtin/codeowners",
  fn: async (ctx: Context) => {
    if (!(await fileExists(ctx, ".github/CODEOWNERS"))) {
      await addIssue(ctx, {
        title: ".github/CODEOWNERS does not exist",

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
