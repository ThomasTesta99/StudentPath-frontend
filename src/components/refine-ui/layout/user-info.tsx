import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { useGetIdentity } from "@refinedev/core";

function initials(name? :string | null, email?: string | null): string{
  const base = (name?.trim() || "").split(/\s+/).filter(Boolean);
  if (base.length >= 2) return (base[0][0] + base[base.length - 1][0]).toUpperCase();
  if (base.length === 1) return base[0].slice(0, 2).toUpperCase();
  const e = (email || "").trim();
  return e ? e.slice(0, 2).toUpperCase() : "??";
}

export function UserInfo() {
  const { data: user, isLoading: userIsLoading } = useGetIdentity<User>();

  if (userIsLoading || !user) {
    return (
      <div className={cn("flex", "items-center", "gap-x-2")}>
        <Skeleton className={cn("h-10", "w-10", "rounded-full")} />
        <div className={cn("flex", "flex-col", "justify-between", "h-10")}>
          <Skeleton className={cn("h-4", "w-32")} />
          <Skeleton className={cn("h-4", "w-24")} />
        </div>
      </div>
    );
  }

  const { name, email } = user;
  const fallback = initials(name, email);

  return (
    <div className={cn("flex", "items-center", "gap-x-4")}>
      {user.image ? (
        <UserAvatar />
      ): (
        <div className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center bg-muted text-xs font-semibold overflow-hidden">
            <span>{fallback}</span>
        </div>
      )}
      <div
        className={cn(
          "flex",
          "flex-col",
          "justify-between",
          "h-10",
          "text-left"
        )}
      >
        <span className={cn("text-sm", "font-medium")}>
          {name}
        </span>
        <span className={cn("text-xs")}>{email}</span>
      </div>
    </div>
  );
}

UserInfo.displayName = "UserInfo";
