import { useState } from "react";
import { Monitor, Globe, Smartphone, Clock, Search, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useLoginHistory, useBlockUser } from "@/hooks/useAdmin";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const deviceIcons = {
  mobile: Smartphone,
  tablet: Smartphone,
  desktop: Monitor,
};

const AdminLoginHistory = () => {
  const { data: entries, isLoading } = useLoginHistory();
  const blockUser = useBlockUser();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const act = (fn, successMsg) => fn({ onSuccess: () => toast({ title: successMsg }), onError: () => toast({ title: "Action failed", variant: "destructive" }) });

  const filtered = (entries || []).filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.ip?.includes(search) ||
      e.browser?.toLowerCase().includes(search.toLowerCase()) ||
      e.os?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Login History ({entries?.length ?? 0})</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search user, IP, browser..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState icon="🔍" title="No login history found" />
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, idx) => {
            const DeviceIcon = deviceIcons[entry.device] || Monitor;
            return (
              <Card key={`${entry.userId}-${idx}`}>
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{entry.name}</p>
                        <Badge variant={entry.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {entry.role}
                        </Badge>
                        {entry.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.email}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(entry.loginAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {entry.ip}
                        </span>
                        <span className="flex items-center gap-1">
                          <DeviceIcon className="h-3 w-3" />
                          {entry.browser} on {entry.os}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={entry.isBlocked}
                        onClick={() => act(blockUser.mutate.bind(null, { id: entry.userId, isBlocked: true }), "User blocked")}
                      >
                        <Ban className="h-4 w-4 text-orange-500 mr-1" /> Block
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={!entry.isBlocked}
                        onClick={() => act(blockUser.mutate.bind(null, { id: entry.userId, isBlocked: false }), "User unblocked")}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" /> Unblock
                      </Button>
                    </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminLoginHistory;
