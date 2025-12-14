import { App } from "@octokit/app";
import { parameterManagerClient, project } from "../google.js";

/*
 * Load the GitHub App configuration from Google Cloud Parameter Manager.
 *
 * The configuration object is stored in parameter "github-app", version "current".
 */
const appOptions = await (async () => {
  const name = parameterManagerClient.parameterVersionPath(project, "global", "github-app", "current");

  const [parameterVersion] = await parameterManagerClient.renderParameterVersion({
    name,
  });
  if (!parameterVersion.renderedPayload) {
    throw new Error("Failed to fetch GitHub App configuration");
  }

  const renderedPayload: string =
    typeof parameterVersion.renderedPayload === "string"
      ? parameterVersion.renderedPayload
      : Buffer.from(parameterVersion.renderedPayload).toString();

  return JSON.parse(renderedPayload);
})();

const app = new App(appOptions);

const { data } = await app.octokit.request("/app");
console.log(`Connected to GitHub as App "${data.name}" (id: ${data.id})`);

export { app };
