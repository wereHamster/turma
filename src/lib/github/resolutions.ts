import type { Context, Issue } from "../engine.js";

/**
 * Propose a resolution for an issue by creating a file at the specified path.
 *
 * This works well for issues where the file can be initialized with reasonable defaults
 * (for example .github/CODEOWNERS).
 */
export async function proposeTextFileResolution(ctx: Context, issue: Issue, { branchName, filePath, content }) {
  const { octokit, repository } = ctx;

  const { data: repoInfo } = await octokit.request("GET /repos/{owner}/{repo}", {
    owner: repository.owner.login,
    repo: repository.name,
  });
  const defaultBranch = repoInfo.default_branch;

  const { data: branchInfo } = await octokit.request("GET /repos/{owner}/{repo}/branches/{branch}", {
    owner: repository.owner.login,
    repo: repository.name,
    branch: defaultBranch,
  });
  const latestCommitSha = branchInfo.commit.sha;

  try {
    await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
      owner: repository.owner.login,
      repo: repository.name,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitSha,
    });
  } catch (error) {
    if (error.status !== 422) {
      throw error;
    }
  }

  let fileSha: string | undefined;
  try {
    const { data: file } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: repository.owner.login,
      repo: repository.name,
      path: filePath,
      ref: branchName,
    });

    if (!("sha" in file)) {
      throw new Error(`Blob at path ${filePath} is not a file`);
    }

    fileSha = file.sha;
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }

  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: repository.owner.login,
    repo: repository.name,
    path: filePath,
    message: `Create ${filePath}`,
    content: Buffer.from(content).toString("base64"),
    branch: branchName,
    sha: fileSha,
  });

  const { data: existingPulls } = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner: repository.owner.login,
    repo: repository.name,
    head: `${repoInfo.owner.login}:${branchName}`,
    state: "open",
  });

  if (existingPulls.length === 0) {
    await octokit.request("POST /repos/{owner}/{repo}/pulls", {
      owner: repository.owner.login,
      repo: repository.name,
      title: `Create ${filePath}`,
      head: branchName,
      base: defaultBranch,
      body: `This is an automated pull request to resolve issue "${issue.issueDescriptor.message}".`,
    });
    console.log(`  ✓ Created PR for ${branchName} in ${repository.owner.login}/${repository.name}`);
  }
}
