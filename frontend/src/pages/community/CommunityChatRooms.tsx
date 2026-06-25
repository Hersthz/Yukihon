import { MessageSquareText, Radio, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ChatRoom } from "@/pages/community/types";

interface CommunityChatRoomsProps {
  rooms: ChatRoom[];
  selectedRoomId: string;
  isLoading?: boolean;
  onSelectRoom: (roomId: string) => void;
}

const accentClasses: Record<string, { shell: string; badge: string; dot: string }> = {
  sky: {
    shell: "border-sky-200/80 bg-sky-50/80 text-sky-900 hover:border-sky-300 hover:bg-sky-100/80",
    badge: "border-sky-200 bg-white text-sky-700",
    dot: "bg-sky-500",
  },
  emerald: {
    shell:
      "border-emerald-200/80 bg-emerald-50/80 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/80",
    badge: "border-emerald-200 bg-white text-emerald-700",
    dot: "bg-emerald-500",
  },
  amber: {
    shell:
      "border-amber-200/80 bg-amber-50/80 text-amber-900 hover:border-amber-300 hover:bg-amber-100/80",
    badge: "border-amber-200 bg-white text-amber-700",
    dot: "bg-amber-500",
  },
  violet: {
    shell:
      "border-violet-200/80 bg-violet-50/80 text-violet-900 hover:border-violet-300 hover:bg-violet-100/80",
    badge: "border-violet-200 bg-white text-violet-700",
    dot: "bg-violet-500",
  },
  rose: {
    shell:
      "border-rose-200/80 bg-rose-50/80 text-rose-900 hover:border-rose-300 hover:bg-rose-100/80",
    badge: "border-rose-200 bg-white text-rose-700",
    dot: "bg-rose-500",
  },
  cyan: {
    shell:
      "border-cyan-200/80 bg-cyan-50/80 text-cyan-900 hover:border-cyan-300 hover:bg-cyan-100/80",
    badge: "border-cyan-200 bg-white text-cyan-700",
    dot: "bg-cyan-500",
  },
};

const getAccentClasses = (accent: string) => accentClasses[accent] ?? accentClasses.sky;

const CommunityChatRooms = ({
  rooms,
  selectedRoomId,
  isLoading = false,
  onSelectRoom,
}: CommunityChatRoomsProps) => (
  <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-lg">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Phòng học trực tiếp
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Chuyển nhanh đến đúng phòng học theo mục tiêu hôm nay.
          </p>
        </div>
        <Badge className="border-slate-200 bg-slate-50 text-slate-600" variant="outline">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {rooms.length} phòng
        </Badge>
      </div>
    </CardHeader>

    <CardContent className="space-y-2.5">
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-3/4" />
            </div>
          ))
        : rooms.map((room) => {
            const tone = getAccentClasses(room.accent);
            const isActive = room.id === selectedRoomId;

            return (
              <button
                key={room.id}
                className={cn(
                  "w-full rounded-2xl border p-3 text-left transition-all duration-200",
                  tone.shell,
                  isActive ? "ring-2 ring-offset-2 ring-slate-900/10 shadow-sm" : "ring-0"
                )}
                onClick={() => onSelectRoom(room.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} />
                      <span className="text-sm font-semibold">{room.title}</span>
                      {isActive ? (
                        <Badge
                          className={cn("px-2 py-0 text-[10px]", tone.badge)}
                          variant="outline"
                        >
                          <Radio className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {room.description}
                    </p>
                  </div>
                  <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      tone.badge
                    )}
                  >
                    {room.focus}
                  </span>
                  <span className="text-xs font-medium text-slate-500">#{room.id}</span>
                </div>
              </button>
            );
          })}
    </CardContent>
  </Card>
);

export default CommunityChatRooms;
