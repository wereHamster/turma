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
  readonly message: string;

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
