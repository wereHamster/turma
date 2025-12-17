import { Firestore } from "@google-cloud/firestore";
import { ParameterManagerClient } from "@google-cloud/parametermanager";
import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth();

const project = await auth.getProjectId();
console.log(`Connected to Google Cloud Project "${project}"`);

const parameterManagerClient = new ParameterManagerClient();

const firestore = new Firestore({
  databaseId: "default",
});

export { auth, project, parameterManagerClient, firestore };
