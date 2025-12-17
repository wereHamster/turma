# Turma

Turma is the base for a GitHub App that checks repositories for compliance against a set of rules.

Think of Turma as a linter for repositories in your GitHub account or organization.
Turma comes with a set of predefined rules, but you can (and should) add your own.
Anything that you can express as a pure (or impure) function over the repository contents, something the GitHub API can return, or any external services can be a rule.

Some of the builtin rules are:

- **readme**: Checks that a `README.md` file exists in the repository.
- **pnpm-lock**: If the repository has a `package.json` file, checks that there is also a `pnpm-lock.yaml` file.
- **stale-branches**: Flags the repository if it contains branches that have not been updated in last 90 days.
- **default-branch-protection**: Checks if the repository has a ruleset to protect the default branch.
- **pin-workflow-actions**: Checks that actions used in workflow are pinned to a hash.
- **comprehensive-readme**: Uses Google AI to check that the `README.md` contains specific information.

Some rule violations can be semi-automatically resolved.
For example, if the `.github/CODEOWNERS` file is missing, Turma can open a pull request that creates the file with a sensible code owner assignment.
Note that the builtin rules will never delete branches, files, configuration etc.
It will always use pull requests to propose resolutions.

## Usage

You need to fork (or clone) the repo to make your own copy.
Then install it, configure, and run to generate the audit report.

It is expected that the existing rules are not appropriate for your own organization.
In your own copy, you can change the code, adjust existing rules, or even write new ones.
The Turma code base is intentionally structured in a way to reduce potential conflicts.

## Installation

### 1. Create a GitHub App

You need to create your own GitHub App.
It is recommended to make it private, so that only your own account or organization can install it.

Give it the following permissions:

- **Administration**: Read only
- **Contents**: Read and write
- **Pull requests**: Read and write

Generate the secrets (client secret, private key) and store somewhere safe.
You'll need them in a later step.

### 2. Create a Google Cloud Project

Turma uses Google Cloud APIs to store configuration and analyze repository contents (using Vertex AI).
For local development, use `gcloud auth login` and then make the project current with `gcloud config set project <project name>`.

You need to enable certain Google Cloud APIs.
The list below may be incomplete.
If the app fails due to an API not being enabled, the error message should tell you which one.

- [Firestore](https://console.cloud.google.com/apis/library/firestore.googleapis.com)
- [Parameter Manager](https://console.cloud.google.com/apis/library/parametermanager.googleapis.com)
- [Vertex AI](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)

Then create a Firestore database with the name "default".
Select "Enterprise Edition" and pick a location that's closest to where the app will run.

### 3. Configure

The application requires only a single parameter: `github-app` (version: `current`).
That parameter stores a JSON object with the configuration for the GitHub App.
You can use the `turmactl.ts` script in this repository to create or update the parameter.
