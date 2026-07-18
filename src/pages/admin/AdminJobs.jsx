import { Cpu, Play, CheckCircle2, XCircle, Loader2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useJobsHealth, useJobRuns, useTriggerJob } from "@/hooks/useJobs";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const JOB_LABELS = {
  "campaign-send": "Campaign dispatch",
  "fraud-scan": "Fraud rules scan",
};

const statusTone = { completed: "default", failed: "destructive", active: "secondary" };
const StatusIcon = ({ status }) =>
  status === "completed" ? (
    <CheckCircle2 className="h-4 w-4 text-green-600" />
  ) : status === "failed" ? (
    <XCircle className="h-4 w-4 text-red-500" />
  ) : (
    <Loader2 className="h-4 w-4 text-stone-400 animate-spin" />
  );

const Stat = ({ label, value, tone = "" }) => (
  <Card>
    <CardContent className="p-3">
      <p className="text-xs text-stone-400 uppercase">{label}</p>
      <p className={`text-xl font-bold ${tone}`}>{value}</p>
    </CardContent>
  </Card>
);

const AdminJobs = () => {
  const { data: health, isLoading: healthLoading } = useJobsHealth();
  const { data: runs, isLoading: runsLoading } = useJobRuns({ limit: 50 });
  const trigger = useTriggerJob();
  const { toast } = useToast();

  const run = (name) =>
    trigger.mutate(name, {
      onSuccess: (r) => {
        const d = r?.data?.data;
        toast({ title: `Triggered ${JOB_LABELS[name] || name} (${d?.mode})` });
      },
      onError: (e) =>
        toast({ title: e?.response?.data?.message || "Trigger failed", variant: "destructive" }),
    });

  const queued = health?.mode === "queued";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Cpu className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold">Background Jobs</h1>
      </div>

      {/* Health */}
      {healthLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : health ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-stone-400 uppercase">Mode</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${queued ? "bg-green-500" : "bg-amber-400"}`}
                  />
                  <p className="text-lg font-bold capitalize">{health.mode}</p>
                </div>
                <p className="text-[11px] text-stone-400">{health.broker}</p>
              </CardContent>
            </Card>
            <Stat label="Total runs" value={health.totalRuns} />
            <Stat
              label="Failed (24h)"
              value={health.failed24h}
              tone={health.failed24h ? "text-red-500" : ""}
            />
            <Stat label="Job types" value={health.triggerable?.length ?? 0} />
          </div>

          {!queued && (
            <p className="text-sm text-stone-400">
              Inline mode — jobs run in-process. Configure <code>REDIS_URL</code> to enable the
              BullMQ broker (retries, concurrency, cross-instance).
            </p>
          )}

          {/* Triggerable jobs */}
          <div className="flex flex-wrap gap-2">
            {(health.triggerable || []).map((name) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                onClick={() => run(name)}
                disabled={trigger.isPending}
              >
                <Play className="h-4 w-4 mr-1" />
                {JOB_LABELS[name] || name}
              </Button>
            ))}
          </div>
        </>
      ) : null}

      {/* Run log */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-stone-400" />
          <h2 className="font-semibold">Recent runs</h2>
        </div>
        {runsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !runs?.length ? (
          <EmptyState icon="⚙️" title="No job runs yet" />
        ) : (
          <div className="space-y-1.5">
            {runs.map((r) => (
              <Card key={r._id}>
                <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon status={r.status} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{JOB_LABELS[r.name] || r.name}</p>
                      <p className="text-xs text-stone-400 truncate">
                        {formatDate(r.createdAt)}
                        {r.error ? ` · ${r.error}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-stone-400">{r.durationMs}ms</span>
                    <Badge variant="outline">{r.mode}</Badge>
                    <Badge variant={statusTone[r.status]}>{r.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;
