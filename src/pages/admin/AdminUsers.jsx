import { useState } from "react";
import { Ban, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useAdminUsers, useBlockUser, useDeleteUser, useApproveOwner } from "@/hooks/useAdmin";
import  { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const AdminUsers = () => {
  const [roleFilter, setRoleFilter] = useState("all");
  const { data: users, isLoading } = useAdminUsers(roleFilter === "all" ? undefined : roleFilter);
  const blockUser = useBlockUser();
  const deleteUser = useDeleteUser();
  const approveOwner = useApproveOwner();
  const { toast } = useToast();

  const act = (fn, successMsg) => fn({ onSuccess: () => toast({ title: successMsg }), onError: () => toast({ title: "Action failed", variant: "destructive" }) });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users ({users?.length ?? 0})</h1>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="owner">Owners</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!users?.length ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  {user.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                  {user.role === "owner" && !user.isApproved && (
                    <Button size="sm" onClick={() => act(approveOwner.mutate.bind(null, user._id), "Owner approved")}>Approve</Button>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => act(blockUser.mutate.bind(null, { id: user._id, isBlocked: !user.isBlocked }), user.isBlocked ? "User unblocked" : "User blocked")}
                  >
                    {user.isBlocked ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Ban className="h-4 w-4 text-orange-500" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 text-destructive"
                    onClick={() => act(deleteUser.mutate.bind(null, user._id), "User deleted")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
