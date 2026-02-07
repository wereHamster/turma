import { addIssue, type Context, type Rule } from "../../lib/engine.js";

const rule: Rule = {
  id: "builtin/default-branch",
  fn: async (ctx: Context) => {
    const { octokit, repository } = ctx;

    const { data: repoInfo } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: repository.owner.login,
      repo: repository.name,
    });
    const defaultBranch = repoInfo.default_branch;

    if (defaultBranch !== "main") {
      addIssue(ctx, {
        priority: 3,

        title: "Default branch is not 'main'",

        description: `The default branch of this repository is named '${defaultBranch}'. The recommended name for the default branch is 'main'.`,

        remediation: `Rename the default branch to 'main'. You can do this in the repository settings under "Branches". Make sure to update any CI/CD configurations that might reference the old branch name.`,
      });
    }
  },
};

export default rule;
