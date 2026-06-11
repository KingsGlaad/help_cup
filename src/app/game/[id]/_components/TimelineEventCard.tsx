import React from "react";
import { Activity, ArrowRightLeft } from "lucide-react";
import { Team, Game } from "@/lib/api";

export type TimelineEvent = {
  id: string;
  time: number;
  timeStr: string;
  team: "home" | "away";
  type: "goal" | "yellow_card" | "red_card" | "sub";
  player: string;
  info?: string;
};

export const TimelineEventCard = ({
  event,
  isHome,
  homeTeam,
  awayTeam,
  game,
}: {
  event: TimelineEvent;
  isHome: boolean;
  homeTeam: Team;
  awayTeam: Team;
  game: Game;
}) => {
  const eventTeamName = isHome
    ? homeTeam?.team_name || game.match_hometeam_name
    : awayTeam?.team_name || game.match_awayteam_name;

  let Icon = Activity;
  let iconColor = "text-primary";
  let bgColor = "bg-primary";

  if (event.type === "yellow_card") {
    bgColor = "bg-yellow-400";
  } else if (event.type === "red_card") {
    bgColor = "bg-red-500";
  } else if (event.type === "sub") {
    Icon = ArrowRightLeft;
    iconColor = "text-muted-foreground";
    bgColor = "bg-muted-foreground/30";
  }

  return (
    <div
      className={`relative flex items-center justify-between md:justify-normal group is-active ${isHome ? "md:flex-row-reverse" : ""}`}
    >
      {/* Card Content */}
      <div
        className={`flex items-center w-full md:w-1/2 ${isHome ? "justify-end md:pr-8" : "justify-start md:pl-8"} ${isHome ? "order-1 md:order-none" : "order-2 md:order-none"}`}
      >
        <div className="p-3 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow min-w-[200px]">
          <div
            className={`flex items-start gap-3 ${isHome ? "flex-row-reverse text-right" : ""}`}
          >
            <div className="mt-0.5">
              {event.type === "goal" ? (
                <Activity className={`w-4 h-4 shrink-0 ${iconColor}`} />
              ) : event.type === "sub" ? (
                <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              ) : (
                <div
                  className={`w-3 h-4 shrink-0 rounded-sm shadow-sm ${bgColor}`}
                />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="font-bold text-sm">
                {event.player.split(" | ").map((p: string, idx: number) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <br />}
                    {p}
                  </React.Fragment>
                ))}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {eventTeamName}
              </span>
              {event.info && (
                <span className="text-xs font-medium text-primary/80 mt-1">
                  {event.info}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dot */}
      <div
        className={`absolute left-5 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-card shadow-sm z-10 ${isHome ? "order-2 md:order-none" : "order-1 md:order-none"}`}
      >
        <span className="text-[10px] font-bold text-muted-foreground">
          {event.timeStr}&apos;
        </span>
      </div>

      {/* Empty Space */}
      <div
        className={`w-full md:w-1/2 ${isHome ? "md:pl-8" : "md:pr-8"} hidden md:block`}
      ></div>
    </div>
  );
};
