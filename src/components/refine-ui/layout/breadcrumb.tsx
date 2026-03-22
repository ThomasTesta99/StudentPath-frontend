"use client";

import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink as ShadcnBreadcrumbLink,
  BreadcrumbList as ShadcnBreadcrumbList,
  BreadcrumbPage as ShadcnBreadcrumbPage,
  BreadcrumbSeparator as ShadcnBreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  matchResourceFromRoute,
  useBreadcrumb,
  useLink,
  useResourceParams,
} from "@refinedev/core";
import { Home } from "lucide-react";
import { Fragment, useMemo } from "react";

export function Breadcrumb() {
  const Link = useLink();
  const { breadcrumbs } = useBreadcrumb();
  const { resources } = useResourceParams();
  const rootRouteResource = matchResourceFromRoute("/", resources);

  const breadCrumbItems = useMemo(() => {
    const list: {
      key: string;
      href?: string;
      label: React.ReactNode;
      isCurrent?: boolean;
    }[] = [];

    list.push({
      key: "breadcrumb-item-home",
      href: rootRouteResource?.matchedRoute ?? "/",
      label: rootRouteResource?.resource?.meta?.icon ?? (
        <Home className="h-4 w-4 shrink-0" />
      ),
      isCurrent: breadcrumbs.length === 0,
    });

    breadcrumbs.forEach(({ label, href }, index) => {
      const isLast = index === breadcrumbs.length - 1;

      list.push({
        key: `breadcrumb-item-${String(label)}`,
        href: isLast ? undefined : href ?? undefined,
        label,
        isCurrent: isLast,
      });
    });

    return list;
  }, [breadcrumbs, rootRouteResource]);

  return (
    <ShadcnBreadcrumb>
      <ShadcnBreadcrumbList>
        {breadCrumbItems.map((item, index) => {
          const isLast = index === breadCrumbItems.length - 1;

          return (
            <Fragment key={item.key}>
              <ShadcnBreadcrumbItem>
                {isLast ? (
                  <ShadcnBreadcrumbPage>{item.label}</ShadcnBreadcrumbPage>
                ) : (
                  <ShadcnBreadcrumbLink asChild>
                    <Link to={item.href ?? "/"}>{item.label}</Link>
                  </ShadcnBreadcrumbLink>
                )}
              </ShadcnBreadcrumbItem>

              {!isLast && <ShadcnBreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </ShadcnBreadcrumbList>
    </ShadcnBreadcrumb>
  );
}

Breadcrumb.displayName = "Breadcrumb";