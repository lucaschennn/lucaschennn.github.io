const REPO_URL = "https://github.com/lucaschennn/lucaschennn.github.io";
const short = (sha) => sha?.slice(0, 7) ?? "none";

const LABELS = {
  live: "✅ Live site is on v2 HEAD",
  pending: "Pushed, waiting for the deploy to start",
  deploying: "Deploying",
  failed: "Last deploy failed",
};

function Commit({ sha }) {
  if (!sha) return "none";
  return <a href={`${REPO_URL}/commit/${sha}`} target="_blank" rel="noreferrer">{short(sha)}</a>;
}

// Presentational; status comes from useDeployStatus().
export default function StatusBar({ status, error }) {
  if (error) return <div className="status status-failed">Status unavailable: {error}</div>;
  if (!status) return <div className="status">Checking deploy status…</div>;

  return (
    <div className={`status status-${status.state}`}>
      <strong>{LABELS[status.state]}</strong>
      {" · "}HEAD <Commit sha={status.head} />
      {status.state !== "live" && <> · live <Commit sha={status.liveSha} /></>}
      {status.runUrl && status.state !== "live" && (
        <> · <a href={status.runUrl} target="_blank" rel="noreferrer">workflow run</a></>
      )}
      {status.liveUrl && (
        <> · <a href={status.liveUrl} target="_blank" rel="noreferrer">lucaschenphoto.com</a></>
      )}
    </div>
  );
}
