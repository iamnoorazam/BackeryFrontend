import { useState } from "react";
import {
  Ban,
  CheckCircle,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  UserSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import UserProfile360 from "@/components/organisms/UserProfile360";
import { useAdminUsers, useBlockUser, useDeleteUser, useApproveOwner } from "@/hooks/useAdmin";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const AddressCard = ({ address, index }) => (
  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-stone-50 rounded-lg p-2">
    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
    <div>
      <p className="font-medium text-stone-700">{address.label || `Address ${index + 1}`}</p>
      <p>
        {[address.street, address.city, address.state, address.pincode].filter(Boolean).join(", ")}
      </p>
    </div>
  </div>
);

const AdminUsers = () => {
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const { data: users, isLoading } = useAdminUsers(roleFilter === "all" ? undefined : roleFilter);
  const blockUser = useBlockUser();
  const deleteUser = useDeleteUser();
  const approveOwner = useApproveOwner();
  const { toast } = useToast();

  const act = (fn, successMsg) =>
    fn({
      onSuccess: () => toast({ title: successMsg }),
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users ({users?.length ?? 0})</h1>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="owner">Owners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!users?.length ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{user.name}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground mt-0.5">
                      {user.email && (
                        <a
                          href={`mailto:${user.email}`}
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          <Mail className="h-3 w-3" /> {user.email}
                        </a>
                      )}
                      {user.phone && (
                        <a
                          href={`tel:${user.phone}`}
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          <Phone className="h-3 w-3" /> {user.phone}
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Joined {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={user.role === "owner" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                    {user.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                    {user.role === "owner" && !user.isApproved && (
                      <Button
                        size="sm"
                        onClick={() =>
                          act(approveOwner.mutate.bind(null, user._id), "Owner approved")
                        }
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => setProfileId(user._id)}
                    >
                      <UserSearch className="h-4 w-4 mr-1 text-teal-600" /> 360
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={user.isBlocked}
                      onClick={() =>
                        act(
                          blockUser.mutate.bind(null, { id: user._id, isBlocked: true }),
                          "User blocked",
                        )
                      }
                    >
                      <Ban className="h-4 w-4 text-orange-500 mr-1" /> Block
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={!user.isBlocked}
                      onClick={() =>
                        act(
                          blockUser.mutate.bind(null, { id: user._id, isBlocked: false }),
                          "User unblocked",
                        )
                      }
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" /> Unblock
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-destructive"
                      onClick={() => act(deleteUser.mutate.bind(null, user._id), "User deleted")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {user.addresses?.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => setExpandedId(expandedId === user._id ? null : user._id)}
                      >
                        {expandedId === user._id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {user.addresses.length} address{user.addresses.length > 1 ? "es" : ""}
                      </Button>
                    )}
                  </div>
                </div>

                {expandedId === user._id && user.addresses?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {user.addresses.map((addr, i) => (
                      <AddressCard key={i} address={addr} index={i} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UserProfile360 userId={profileId} open={!!profileId} onClose={() => setProfileId(null)} />
    </div>
  );
};

export default AdminUsers;
