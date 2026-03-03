import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, History, Newspaper, Settings2 } from "lucide-react";
import type React from "react";
import { useUnreadNotificationCount } from "../hooks/useQueries";
import NewsPanel from "./NewsPanel";
import NewsTickerBanner from "./NewsTickerBanner";
import NotificationsPanel from "./NotificationsPanel";
import ParentSettings from "./ParentSettings";
import SearchHistory from "./SearchHistory";

const ParentMode: React.FC = () => {
  const { data: unreadCount } = useUnreadNotificationCount();
  const unread = unreadCount ? Number(unreadCount) : 0;

  return (
    <div className="relative z-10 flex flex-col min-h-[calc(100vh-64px)]">
      {/* News Ticker Banner at very top */}
      <NewsTickerBanner />

      {/* Parent Mode Header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-3xl">🔐</span>
          <h2
            className="font-fredoka text-2xl font-bold"
            style={{ color: "oklch(0.82 0.18 85)" }}
          >
            Parent Dashboard
          </h2>
        </div>
        <p
          className="font-nunito text-sm font-semibold"
          style={{ color: "oklch(0.55 0.05 265)" }}
        >
          Monitor your child's learning activity
        </p>
      </div>

      {/* Tabs */}
      <div className="flex-1 px-4 pb-4">
        <Tabs defaultValue="history" className="h-full flex flex-col">
          <TabsList
            className="w-full mb-4 rounded-2xl p-1 h-auto"
            style={{
              background: "oklch(0.16 0.05 265)",
              border: "1px solid oklch(0.28 0.07 265)",
            }}
          >
            <TabsTrigger
              value="history"
              data-ocid="parent.history.tab"
              className="flex-1 rounded-xl font-nunito font-bold text-xs py-2 data-[state=active]:text-foreground transition-all"
              style={{ gap: "5px" }}
            >
              <History size={13} />
              History
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              data-ocid="parent.alerts.tab"
              className="flex-1 rounded-xl font-nunito font-bold text-xs py-2 data-[state=active]:text-foreground transition-all relative"
              style={{ gap: "5px" }}
            >
              <Bell size={13} />
              Alerts
              {unread > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-nunito text-xs font-black"
                  style={{
                    background: "oklch(0.78 0.20 45)",
                    color: "oklch(0.12 0.04 265)",
                    fontSize: "9px",
                  }}
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="news"
              data-ocid="parent.news.tab"
              className="flex-1 rounded-xl font-nunito font-bold text-xs py-2 data-[state=active]:text-foreground transition-all"
              style={{ gap: "5px" }}
            >
              <Newspaper size={13} />
              News
            </TabsTrigger>
            <TabsTrigger
              value="controls"
              data-ocid="parent.controls.tab"
              className="flex-1 rounded-xl font-nunito font-bold text-xs py-2 data-[state=active]:text-foreground transition-all"
              style={{ gap: "5px" }}
            >
              <Settings2 size={13} />
              Controls
            </TabsTrigger>
          </TabsList>

          <div
            className="flex-1 rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.14 0.05 265)",
              border: "1px solid oklch(0.25 0.06 265)",
              minHeight: "400px",
            }}
          >
            <TabsContent
              value="history"
              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <SearchHistory />
            </TabsContent>
            <TabsContent
              value="notifications"
              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <NotificationsPanel />
            </TabsContent>
            <TabsContent
              value="news"
              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <NewsPanel />
            </TabsContent>
            <TabsContent
              value="controls"
              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <ParentSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentMode;
