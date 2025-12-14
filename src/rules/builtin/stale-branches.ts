import { addIssue, type Context, type Rule } from "../../lib/engine.js";

const rule: Rule = {
  id: "builtin/stale-branches",
  fn: async (ctx: Context) => {
    const { octokit, repository } = ctx;

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
          const { data } = await octokit.request(branch.commit.url);
          return new Date(data.commit.author.dat) < ninetyDaysAgo ? [branch] : [];
        }),
      )
    ).flat();

    if (staleBranches.length > 0) {
      addIssue(ctx, {
        message: `Stale branches (${staleBranches.map((b) => b.name).join(", ")})`,
      });
    }
  },
};

export default rule;
