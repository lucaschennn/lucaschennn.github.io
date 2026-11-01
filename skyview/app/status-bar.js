const short = (sha) => sha?.slice(0, 7) ?? "none";

const LABELS = {
  live: "Live = v2 HEAD",
  pending: "Pushed, waiting for the deploy to start",
  deploying: "Deploying",
  failed: "Last deploy failed",
};

// Presentational; status comes from useDeployStatus().
export default function StatusBar({ status, error }) {
  if (error) return <div className="status status-failed">Status unavailable: {error}</div>;
  if (!status) return <div className="status">Checking deploy status…</div>;

  return (
    <div className={`status status-${status.state}`}>
      <strong>{LABELS[status.state]}</strong>
      {" · "}HEAD {short(status.head)}
      {status.state !== "live" && <> · live {short(status.liveSha)}</>}
      {status.runUrl && status.state !== "live" && (
        <> · <a href={status.runUrl} target="_blank" rel="noreferrer">workflow run</a></>
      )}
      {status.liveUrl && (
        <> · <a href={status.liveUrl} target="_blank" rel="noreferrer">site</a></>
      )}
    </div>
  );
}
