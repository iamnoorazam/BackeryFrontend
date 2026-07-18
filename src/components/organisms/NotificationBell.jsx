import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Package, X, CheckCheck } from "lucide-react";
import {
  useCustomerNotifications,
  useMarkAllRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { formatDate, getStatusColor } from "@/lib/utils";

/**
 * Customer notification center (Phase 2, Module 7). A bell with an unread badge
 * and a dropdown of recent notifications, refreshed live via the customer's
 * socket. Order notifications deep-link to the Orders page.
 */
const NotificationBell = () => {
  const navigate = useNavigate();
  const { data: notifications } = useCustomerNotifications();
  const markAllRead = useMarkAllRead();
  const deleteNotification = useDeleteNotification();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const list = notifications || [];
  const unreadCount = list.filter((n) => !n.isRead).length;
  const recent = list.slice(0, 12);

  const handleOpen = (n) => {
    setOpen(false);
    if (n.data?.orderId || n.type === "order") navigate("/orders");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 rounded-xl hover:bg-muted transition-colors flex items-center justify-center relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-24px)] max-h-[460px] overflow-y-auto bg-popover rounded-2xl shadow-elevated border border-border z-50">
          <div className="sticky top-0 bg-popover z-10 flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-primary hover:opacity-80 font-semibold flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground/70">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleOpen(n)}
                  className={`group flex gap-3 px-4 py-3 hover:bg-muted transition-colors cursor-pointer ${!n.isRead ? "bg-primary/5" : ""}`}
                >
                  <div className="shrink-0 h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {n.data?.orderStatus && (
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${getStatusColor(n.data.orderStatus)}`}
                        >
                          {n.data.orderStatus.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/70">{formatDate(n.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification.mutate(n._id);
                    }}
                    className="shrink-0 self-start p-1 rounded-lg text-muted-foreground/50 hover:text-danger hover:bg-danger-subtle opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
