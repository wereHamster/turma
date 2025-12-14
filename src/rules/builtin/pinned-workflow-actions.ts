import { addIssue, type Context, type Rule } from "../../lib/engine.js";
import { readTextFile } from "../../lib/github/queries.js";

/*
 * Makes sure that all actions used in GitHub workflows are pinned to
 * a specific commit hash, with the tag being added at the end of the
 * line in a comment.
 *
 * For example:
 *
 *  - uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # v6.0.1
 */

const rule: Rule = {
  id: "builtin/pinned-workflow-actions",
  fn: async (ctx: Context) => {
    const { octokit, repository } = ctx;

    const workflowFiles = await (async () => {
      try {
        const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/.github/workflows", {
          owner: repository.owner.login,
          repo: repository.name,
        });
        return data;
      } catch (error) {
        if (error.status === 404) {
          return [];
        }

        throw error;
      }
    })();

    for (const file of workflowFiles) {
      const content = await readTextFile(ctx, `.github/workflows/${file.name}`);

      (() => {
        for (const line of content.split("\n")) {
          const usesMatch = line.match(/^\s*- uses: ([\w\-./@]+)(#.*)?$/);
          if (usesMatch) {
            const comment = usesMatch[2];

            if (!comment || !comment.trim().startsWith("#")) {
              addIssue(ctx, {
                message: `Workflow ${file.name} uses unpinned actions`,
              });

              return;
            }
          }
        }
      })();
    }
  },
};

export default rule;
