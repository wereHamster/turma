import type { Octokit } from "@octokit/core";

export interface Context {
  readonly octokit: Octokit;
  readonly repository: Repository;
  readonly rule: Rule;

  readonly issues: Array<Issue>;
}

/**
 * Minimal representation of a GitHub repository.
 * Keep this compatible with the type used by the GitHub API (Octokit).
 */
export interface Repository {
  readonly owner: {
    readonly login: string;
  };
  readonly name: string;
}

export interface Rule {
  /**
   * A unique ID for the rule.
   *
   * It should be unique across all rules that the engine is configured with.
   *
   * Various identifiers are derived from it. Such as the branch name for the
   * proposed resolution. You should therefore use only lower-case alphanumeric
   * characters and hyphens.
   */
  readonly id: string;

  readonly fn?: (ctx: Context) => Promise<void>;
}

export interface IssueDescriptor {
  /**
   * A short title for the issue.
   *
   * The title should uniquely identify the issue (think of it as a human
   * readable Issue ID). It should not contain violation-specific details.
   * Those go into the description.
   *
   * Example: "Repository is missing a LICENSE file"
   */
  readonly title: string;

  /**
   * A longer, more detailed description of the issue. This should contain
   * specific details about the rule violation to help users understand
   * the issue.
   *
   * The decription is interpreted as markdown. It can contain the following
   * block and inline elements:
   *
   *  - Block: paragraph, list
   *  - Inline: bold, italic, link
   */
  readonly description?: string;

  readonly proposeResolution?: (ctx: Context, issue: Issue) => Promise<void>;
}

export interface Issue {
  readonly repository: Repository;
  readonly rule: Rule;

  readonly issueDescriptor: IssueDescriptor;
}

/**
 * This function is used in the rule evaluation functions to report issues.
 */
export async function addIssue(ctx: Context, issueDescriptor: IssueDescriptor) {
  ctx.issues.push({
    repository: ctx.repository,
    rule: ctx.rule,

    issueDescriptor,
  });
}
