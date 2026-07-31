"use client";

import { useOptimistic, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { toggleFollow, type FollowTargetType } from "@/lib/actions/follow";
import { cn } from "@/lib/utils";

export function FollowButton({ targetType, targetId, initialIsFollowing, className }: { targetType: FollowTargetType; targetId: string; initialIsFollowing: boolean; className?: string }) {
  const [pending, startTransition] = useTransition();
  const [following, setOptimisticFollowing] = useOptimistic(initialIsFollowing);
  return <button type="button" disabled={pending} onClick={() => startTransition(async () => { setOptimisticFollowing(!following); const result = await toggleFollow(targetType, targetId); if (result.error) setOptimisticFollowing(following); })} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-60", following ? "border-[#168a9b] bg-[#e5f4f6] text-[#0e5e6f]" : "border-[#0e5e6f] text-[#0e5e6f] hover:bg-[#e5f4f6]", className)}>{following ? <><Check className="h-3.5 w-3.5" />Urmărești</> : <><Plus className="h-3.5 w-3.5" />Urmărește</>}</button>;
}
