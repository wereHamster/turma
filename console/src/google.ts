import { Firestore } from "@google-cloud/firestore";
import { getVercelOidcToken } from "@vercel/functions/oidc";
import { type AuthClient, ExternalAccountClient } from "google-auth-library";

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;

const authClient: undefined | AuthClient = (() => {
  if (!GCP_PROJECT_ID || !GCP_PROJECT_NUMBER) {
    return undefined;
  }

  return (
    ExternalAccountClient.fromJSON({
      type: "external_account",
      audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/vercel/providers/vercel`,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/vercel@${GCP_PROJECT_ID}.iam.gserviceaccount.com:generateAccessToken`,
      subject_token_supplier: {
        getSubjectToken: getVercelOidcToken,
      },
    }) ?? undefined
  );
})();

const firestore = new Firestore({
  databaseId: "default",

  authClient,
  projectId: GCP_PROJECT_ID,
});

export { firestore };
