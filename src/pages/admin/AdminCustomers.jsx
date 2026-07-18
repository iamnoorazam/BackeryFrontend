import { useState, useMemo } from "react";
import { Search, Mail, Phone, MapPin, Calendar, Ban, CheckCircle, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useAdminUsers, useBlockUser, useDeleteUser } from "@/hooks/useAdmin";
import { useToast } from "@/store/Toast";
import { formatDate } from "@/lib/utils";

const AdminCustomers = () => {
  const { data: customers, isLoading } = useAdminUsers("customer");
  const blockUser = useBlockUser();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers || [];
    return (customers || []).filter((c) =>
      [c.name, c.email, c.phone].filter(Boolean).some((v) => v.toLowerCase().includes(q)),
    );
  }, [customers, search]);

  const act = (fn, successMsg) =>
    fn({
      onSuccess: () => toast({ title: successMsg }),
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  const total = customers?.length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-[#D2691E]" /> Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} registered {total === 1 ? "customer" : "customers"}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState
          icon="👥"
          title={search ? "No matching customers" : "No customers yet"}
          description={search ? "Try a different search term." : "Customer accounts appear here as soon as people sign up."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const addr = c.addresses?.[0];
            const addrText = addr
              ? [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")
              : null;
            return (
              <Card key={c._id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Identity */}
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#D2691E] to-[#9E2B5E] text-white flex items-center justify-center font-bold text-lg">
                      {c.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-stone-900 truncate">{c.name}</p>
                        {c.isBlocked && <Badge variant="destructive" className="shrink-0">Blocked</Badge>}
                      </div>
                      <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> Joined {formatDate(c.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Contact + address details */}
                  <div className="space-y-1.5 text-sm">
                    <p className="flex items-center gap-2 text-stone-600 min-w-0">
                      <Mail className="h-4 w-4 text-stone-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </p>
                    <p className="flex items-center gap-2 text-stone-600">
                      <Phone className="h-4 w-4 text-stone-400 shrink-0" />
                      {c.phone ? c.phone : <span className="text-stone-300">Not provided</span>}
                    </p>
                    <p className="flex items-start gap-2 text-stone-600">
                      <MapPin className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                      {addrText ? (
                        <span className="min-w-0">
                          {addrText}
                          {c.addresses.length > 1 && (
                            <span className="text-xs text-stone-400"> +{c.addresses.length - 1} more</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-stone-300">No address saved</span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9"
                      disabled={c.isBlocked}
                      onClick={() => act(blockUser.mutate.bind(null, { id: c._id, isBlocked: true }), "Customer blocked")}
                    >
                      <Ban className="h-4 w-4 text-orange-500 mr-1" /> Block
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9"
                      disabled={!c.isBlocked}
                      onClick={() => act(blockUser.mutate.bind(null, { id: c._id, isBlocked: false }), "Customer unblocked")}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" /> Unblock
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 text-destructive shrink-0"
                      onClick={() => act(deleteUser.mutate.bind(null, c._id), "Customer deleted")}
                    >
                      <Trash2 className="h-4 w-4" />
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

export default AdminCustomers;
