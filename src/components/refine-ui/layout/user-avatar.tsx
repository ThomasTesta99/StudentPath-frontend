import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetIdentity } from "@refinedev/core";
import { initials } from "./user-info";

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
