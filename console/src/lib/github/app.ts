/*
 * The ParameterManager client is not compatible with ExternalAccountClient
 * authentication. So we can't load the GitHub app configuration from the
 * Google Cloud. Instead, we expect the oauth client ID and secret to be
 * provided via environment variables.
 */

const appOptions = await (async () => {
  return {
    oauth: {
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
    },
  };
})();

export { appOptions };
