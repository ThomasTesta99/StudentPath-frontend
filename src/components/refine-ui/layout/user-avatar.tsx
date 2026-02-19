import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetIdentity } from "@refinedev/core";

function initials(name? :string | null, email?: string | null): string{
  const base = (name?.trim() || "").split(/\s+/).filter(Boolean);
  if (base.length >= 2) return (base[0][0] + base[base.length - 1][0]).toUpperCase();
  if (base.length === 1) return base[0].slice(0, 2).toUpperCase();
  const e = (email || "").trim();
  return e ? e.slice(0, 2).toUpperCase() : "??";
}


type Identity = {
  name: string
  email: string;
  image?: string;
};

export function UserAvatar() {
  const { data: user, isLoading: userIsLoading } = useGetIdentity<Identity>();

  if (userIsLoading || !user) {
    return <Skeleton className={cn("h-10", "w-10", "rounded-full")} />;
  }

  const { name, email, image } = user;

  return (
    <Avatar className={cn("h-10", "w-10")}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback>{initials(name, email)}</AvatarFallback>
    </Avatar>
  );
}


UserAvatar.displayName = "UserAvatar";
