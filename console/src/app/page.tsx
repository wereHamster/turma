import type { QueryDocumentSnapshot } from "@google-cloud/firestore";
import { firestore } from "../lib/google";

export default async function Page() {
  const runsQuerySnapshot = await firestore.collection("runs").orderBy("createTime", "desc").limit(1).get();

  return (
    <div>
      {runsQuerySnapshot.docs.map((run) => {
        return <Run key={run.id} run={run} />;
      })}
    </div>
  );
}

async function Run(props: { run: QueryDocumentSnapshot }) {
  const { run } = props;

  /*
   * The Firestore API does not support aggregations (group by) yet. So we fetch
   * all issues for the run and group them by repository manually.
   */
  const issuesQuerySnapshot = await firestore.collection("issues").where("run.id", "==", run.id).get();
  const byRepository = issuesQuerySnapshot.docs.reduce(
    (acc, issue) => {
      const repo = issue.data().repository.name;
      if (!acc[repo]) {
        acc[repo] = [];
      }
      acc[repo].push(issue);
      return acc;
    },
    {} as Record<string, QueryDocumentSnapshot[]>,
  );

  return (
    <div>
      <h2>Run ID: {run.id}</h2>

      <div>Created At: {new Date(run.data().createTime._seconds * 1000).toLocaleString()}</div>

      <div>
        {Object.entries(byRepository).map(([repo, issues]) => {
          const repository = issues[0].data().repository;

          return (
            <div key={repo} style={{ marginBottom: "2rem" }}>
              <h3>
                Repository: <a href={`https://github.com/${repository.owner.login}/${repository.name}`}>{repo}</a>
              </h3>

              {issues.map((issue) => {
                return (
                  <div key={issue.id} style={{ marginLeft: "2rem" }}>
                    <h4>Issue: {issue.data().message}</h4>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
