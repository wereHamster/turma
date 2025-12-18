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

    const treeEntries = await (async () => {
      try {
        const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
          owner: repository.owner.login,
          repo: repository.name,
          path: ".github/workflows",
        });
        return data;
      } catch (error) {
        if (error.status === 404) {
          return [];
        }

        throw error;
      }
    })();

    if (!Array.isArray(treeEntries)) {
      return;
    }

    const workflowFiles = treeEntries.filter((file) => file.type === "file");

    const workflowsWithUnpinnedActions = new Set<string>();

    for (const file of workflowFiles) {
      const content = await readTextFile(ctx, `.github/workflows/${file.name}`);

      (() => {
        for (const line of content.split("\n")) {
          const usesMatch = line.match(/^\s*- uses: ([\w\-./@]+)(#.*)?$/);
          if (usesMatch) {
            const comment = usesMatch[2];

            if (!comment || !comment.trim().startsWith("#")) {
              workflowsWithUnpinnedActions.add(file.name);
              return;
            }
          }
        }
      })();
    }

    if (workflowsWithUnpinnedActions.size > 0) {
      addIssue(ctx, {
        priority: 1,
        title: `Workflows use unpinned actions`,

        description: `The repository contains GitHub workflow files that use actions without pinning them to a specific commit hash.

The following workflow files use unpinned actions:

${[...workflowsWithUnpinnedActions].map((f) => ` - ${f}`).join("\n")}
`,

        remediation: `Update the workflow files to pin all actions to specific commit hashes. This can be done by adding a comment with the tag at the end of the line where the action is used. For example:

\`\`\`yaml
- uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # v6.0.1
\`\`\`

Pinning actions helps ensure that your workflows are not affected by changes in the action's codebase, improving security and stability.`,
      });
    }
  },
};

export default rule;
