import type { Context } from "../engine.js";

/**
 * Return true if the file exists in the repository.
 */
export async function fileExists(ctx: Context, path: string): Promise<boolean> {
  const { octokit, repository } = ctx;

  try {
    await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: repository.owner.login,
      repo: repository.name,
      path,
    });

    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }

    throw error;
  }
}

/**
 * Read the content of a file in the repository, as a UTF-8 string.
 */
export async function readTextFile(ctx: Context, path: string): Promise<string> {
  const { octokit, repository } = ctx;

  const file = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: repository.owner.login,
    repo: repository.name,
    path,
  });

  if (!("type" in file.data) || file.data.type !== "file") {
    throw new Error(`Blob at path ${path} is not a file`);
  }

  return Buffer.from(file.data.content, "base64").toString("utf8");
}
