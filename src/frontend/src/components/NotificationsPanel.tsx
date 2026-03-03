import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Clock } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "../hooks/useQueries";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const NotificationsPanel: React.FC = () => {
  const { data: notifications, isLoading, error } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (notifications?.some((n) => !n.isRead)) {
      markAllRead.mutate();
    }
  }, [notifications, markAllRead.mutate]);

  const sortedNotifications = notifications
    ? [...notifications].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {["ns-a", "ns-b", "ns-c", "ns-d", "ns-e"].map((id) => (
          <Skeleton
            key={id}
            className="h-16 rounded-xl"
            style={{ background: "oklch(0.20 0.06 265)" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="text-4xl mb-3">⚠️</div>
        <p
          className="font-nunito font-semibold"
          style={{ color: "oklch(0.65 0.22 25)" }}
        >
          Could not load notifications.
        </p>
      </div>
    );
  }

  if (sortedNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="text-5xl mb-4 animate-float">🔔</div>
        <h3
          className="font-fredoka text-xl font-bold mb-2"
          style={{ color: "oklch(0.82 0.18 85)" }}
        >
          No notifications yet!
        </h3>
        <p
          className="font-nunito text-sm font-semibold"
          style={{ color: "oklch(0.55 0.05 265)" }}
        >
          You'll be notified when your child asks questions.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} style={{ color: "oklch(0.78 0.20 45)" }} />
          <span
            className="font-nunito text-sm font-bold"
            style={{ color: "oklch(0.78 0.20 45)" }}
          >
            {sortedNotifications.length} notification
            {sortedNotifications.length !== 1 ? "s" : ""}
          </span>
        </div>

        {sortedNotifications.map((notif) => (
          <div
            key={`${notif.timestamp.toString()}-${notif.message.slice(0, 10)}`}
            className="rounded-xl p-4 transition-all duration-200"
            style={{
              background: notif.isRead
                ? "oklch(0.18 0.05 265)"
                : "oklch(0.78 0.20 45 / 0.08)",
              border: `1px solid ${notif.isRead ? "oklch(0.28 0.07 265)" : "oklch(0.78 0.20 45 / 0.4)"}`,
              boxShadow: notif.isRead
                ? "none"
                : "0 0 10px oklch(0.78 0.20 45 / 0.1)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: notif.isRead
                    ? "oklch(0.22 0.06 265)"
                    : "oklch(0.78 0.20 45 / 0.2)",
                  border: `1px solid ${notif.isRead ? "oklch(0.30 0.07 265)" : "oklch(0.78 0.20 45 / 0.5)"}`,
                }}
              >
                <Bell
                  size={14}
                  style={{
                    color: notif.isRead
                      ? "oklch(0.55 0.05 265)"
                      : "oklch(0.78 0.20 45)",
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-nunito text-sm font-semibold leading-snug mb-1"
                  style={{ color: "oklch(0.88 0.03 265)" }}
                >
                  {notif.message}
                </p>
                <div className="flex items-center gap-1">
                  <Clock size={11} style={{ color: "oklch(0.50 0.05 265)" }} />
                  <span
                    className="font-nunito text-xs"
                    style={{ color: "oklch(0.50 0.05 265)" }}
                  >
                    {formatTimestamp(notif.timestamp)}
                  </span>
                  {!notif.isRead && (
                    <span
                      className="ml-2 font-nunito text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.78 0.20 45 / 0.2)",
                        color: "oklch(0.78 0.20 45)",
                      }}
                    >
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationsPanel;
