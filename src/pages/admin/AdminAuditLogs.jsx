import { useState } from "react";
import { ScrollText, User, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useAuditLog } from "@/hooks/useAdmin";
import { formatDate } from "@/lib/utils";

// Color-code the action by its group prefix.
const actionTone = (action = "") => {
  if (action.startsWith("admin.")) return "default";
  if (action.includes(".reject") || action.includes(".block") || action.includes(".delete"))
    return "destructive";
  return "secondary";
};

const AdminAuditLogs = () => {
  const [prefix, setPrefix] = useState("");
  const [page, setPage] = useState(1);
  // Debounce-free: the prefix filter applies on change; page resets when it does.
  const params = { page, limit: 50, ...(prefix ? { actionPrefix: prefix } : {}) };
  const { data, isLoading, isFetching } = useAuditLog(params);

  const items = data?.items || [];
  const pages = data?.pages || 1;

  const onPrefix = (v) => {
    setPrefix(v);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold">Audit Log</h1>
          {isFetching && <Spinner className="h-4 w-4" />}
        </div>
        <div className="w-64">
          <Input
            placeholder="Filter by action prefix (e.g. vendor.)"
            value={prefix}
            onChange={(e) => onPrefix(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : !items.length ? (
        <EmptyState icon="📜" title="No audit entries" />
      ) : (
        <>
          <div className="space-y-2">
            {items.map((e) => (
              <Card key={e._id}>
                <CardContent className="p-4 flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={actionTone(e.action)} className="font-mono text-xs">
                        {e.action}
                      </Badge>
                      {e.targetType && (
                        <span className="text-xs text-muted-foreground">
                          {e.targetType}:{" "}
                          <span className="font-mono">{String(e.targetId).slice(-8)}</span>
                        </span>
                      )}
                      {e.status === "failure" && <Badge variant="destructive">failed</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {e.actor?.name || "—"}
                        {e.actor?.adminRole ? ` (${e.actor.adminRole})` : ""}
                      </span>
                      <span>{formatDate(e.createdAt)}</span>
                      {e.ip && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {e.ip}
                        </span>
                      )}
                    </div>
                    {e.meta && Object.keys(e.meta).length > 0 && (
                      <pre className="mt-2 text-xs bg-stone-50 dark:bg-stone-900 rounded p-2 overflow-x-auto">
                        {JSON.stringify(e.meta)}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data?.page ?? page} of {pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAuditLogs;
