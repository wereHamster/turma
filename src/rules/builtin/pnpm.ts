import { addIssue, type Context, type Rule } from "../../lib/engine.js";
import { fileExists, readTextFile } from "../../lib/github/queries.js";
import { proposeTextFileResolution } from "../../lib/github/resolutions.js";

const rule: Rule = {
  id: "builtin/pnpm",
  fn: async (ctx: Context) => {
    if (!(await fileExists(ctx, "package.json"))) {
      return;
    }

    if (!(await fileExists(ctx, "pnpm-lock.yaml"))) {
      await addIssue(ctx, {
        priority: 2,
        title: "Project is not using pnpm",

        description: `Node.js projects should use pnpm as their package manager instead of npm or yarn.`,

        remediation: `Use \`pnpm migrate\` to migrate the project to pnpm.`,
      });

      return;
    }

    if (!(await fileExists(ctx, "pnpm-workspace.yaml"))) {
      await addIssue(ctx, {
        priority: 3,
        title: "Project does not define a pnpm workspace",

        description: `Node.js projects should define a pnpm workspace and set a minimumReleaseAge.`,

        remediation: `Create a \`pnpm-workspace.yaml\` file and set minimumReleaseAge to at least 9 days (12960 minutes).`,

        proposeResolution: async (ctx, issue) => {
          await proposeTextFileResolution(ctx, issue, {
            branchName: `turma/${issue.rule.id}-workspace`,

            filePath: "pnpm-workspace.yaml",
            content: "packages:\n  - '.'\n\nminimumReleaseAge: 12960\n",
          });
        },
      });

      return;
    }

    const contents = await readTextFile(ctx, "pnpm-workspace.yaml");
    const minimumReleaseAgeMatch = /minimumReleaseAge:\s*(\d+)/.exec(contents);
    if (!minimumReleaseAgeMatch) {
      await addIssue(ctx, {
        priority: 3,
        title: "Pnpm workspace does not define minimumReleaseAge",

        description: `Node.js projects should define a minimumReleaseAge in their pnpm workspace.`,

        remediation: `Add minimumReleaseAge to the \`pnpm-workspace.yaml\` file and set it to at least 9 days (12960 minutes).`,

        proposeResolution: async (ctx, issue) => {
          await proposeTextFileResolution(ctx, issue, {
            branchName: `turma/${issue.rule.id}-set-minimum-release-age`,

            filePath: "pnpm-workspace.yaml",
            content: `${contents}\nminimumReleaseAge: 12960\n`,
          });
        },
      });

      return;
    }

    const minimumReleaseAge = parseInt(minimumReleaseAgeMatch[1], 10);
    if (minimumReleaseAge < 12960) {
      await addIssue(ctx, {
        priority: 3,
        title: "Pnpm workspace has low minimumReleaseAge",

        description: `Node.js projects should set a minimumReleaseAge of at least 9 days (12960 minutes) in their pnpm workspace. The current setting is ${minimumReleaseAge} minutes.`,

        remediation: `Increase minimumReleaseAge in the \`pnpm-workspace.yaml\` file to at least 12960.`,

        proposeResolution: async (ctx, issue) => {
          await proposeTextFileResolution(ctx, issue, {
            branchName: `turma/${issue.rule.id}-increase-minimum-release-age`,

            filePath: "pnpm-workspace.yaml",
            content: contents.replace(/minimumReleaseAge:\s*\d+/, "minimumReleaseAge: 12960"),
          });
        },
      });
    }
  },
};

export default rule;
