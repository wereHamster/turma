import ansis from "ansis";
import type { Issue } from "../lib/engine.js";
import { app } from "../lib/github/app.js";
import { allRules } from "../rules/index.js";

for await (const { installation } of app.eachInstallation.iterator()) {
  const installationId = installation.id;

  for await (const { octokit, repository } of app.eachRepository.iterator({ installationId })) {
    /*
     * Skip archived repositories.
     *
     * Archived repositories on GitHub are read-only. If we reported issues on
     * those repositories, the user would not be able to fix them anyways.
     */
    if (repository.archived) {
      continue;
    }

    /*
     * Skip forked repositories.
     *
     * We do not want to impose any rules on forked repositories. Usually forks
     * are temporary and used for contributions to the main repository.
     *
     * Though in some cases (such as when the fork is long-lived) we might want
     * to apply some rules. That is left for future consideration.
     */
    if (repository.fork) {
      continue;
    }

    /*
     * This array will hold all the issues found for the current repository.
     */
    const issues: Array<Issue> = [];

    /*
     * Process all rules concurrently.
     *
     * There is a slight danger that we'll eventually hit GitHub API rate limits. If we
     * do, we can always add concurrency limits later.
     */
    await Promise.all(
      allRules.map(async (rule) => {
        try {
          await rule.fn({ octokit, repository, issues, rule });
        } catch (error) {
          console.error(`Error evaluating rule ${rule.id} for ${repository.owner.login}/${repository.name}`);
          console.error(error);
        }
      }),
    );

    /*
     * Report any issues found to the console.
     *
     * TODO: Make the report prettier.
     */
    if (issues.length > 0) {
      console.log();
      console.log(`${ansis.underline(`${repository.owner.login}/${repository.name}`)} (issues: ${issues.length})`);
      console.log();

      for (const issue of issues) {
        const { issueDescriptor } = issue;

        console.log(`Issue: ${ansis.red(`${issueDescriptor.message}`)}`);
        if (issueDescriptor.proposeResolution) {
          if (!process.env.WRITE) {
            console.log(`  Automatic Resolution: ${ansis.yellow("Available")}`);
          } else {
            try {
              await issueDescriptor.proposeResolution({ octokit, repository, rule: issue.rule, issues }, issue);
              console.log(`  Automatic Resolution: ${ansis.green("Proposed")}`);
            } catch {
              console.log(`  Automatic Resolution: ${ansis.red("Failed")}`);
            }
          }
        }
        console.log();
      }
    }
  }
}
