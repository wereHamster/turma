import { addIssue, type Context, type Rule } from "../../lib/engine.js";

const rule: Rule = {
  id: "builtin/stale-branches",
  fn: async (ctx: Context) => {
    const { octokit, repository } = ctx;

    const { data: repoInfo } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: repository.owner.login,
      repo: repository.name,
    });
    const defaultBranch = repoInfo.default_branch;

    const branches = await octokit.request("GET /repos/{owner}/{repo}/branches", {
      owner: repository.owner.login,
      repo: repository.name,
    });

    /*
     * The time period for considering a branch "stale" is 90 days. This
     * is currently not configurable.
     */
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const staleBranches = (
      await Promise.all(
        branches.data.map(async (branch) => {
          if (branch.name === defaultBranch) {
            return [];
          }

          const { data } = await octokit.request(branch.commit.url);
          return new Date(data.commit.author.date) < ninetyDaysAgo ? [branch] : [];
        }),
      )
    ).flat();

    if (staleBranches.length > 0) {
      addIssue(ctx, {
        priority: 4,
        title: "Stale branches",

        description: `The repository contains branches that have not been updated in 90 days.

The following branches are considered stale:

${staleBranches.map((b) => ` - ${b.name}`).join("\n")}
`,

        remediation: `Delete branches that are no longer needed, merge pull requests if they are ready and approved, or continue working on the branch to bring the change to completion.`,
      });
    }
  },
};

export default rule;
