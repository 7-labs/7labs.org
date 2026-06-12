"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AnalyticsEventName, trackEvent } from "@/lib/analytics";

type TrackedLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  eventName: AnalyticsEventName;
  eventPayload?: {
    page?: string;
    toolSlug?: string;
    category?: string;
    target?: string;
    value?: string;
  };
};

export function TrackedLink({ href, className, children, eventName, eventPayload }: TrackedLinkProps) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => trackEvent({ event: eventName, target: href, ...eventPayload })}
    >
      {children}
    </Link>
  );
}
