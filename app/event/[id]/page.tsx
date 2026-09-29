"use client";

import { useParams } from "next/navigation";
import { EventDetailApp } from "@/components/event-detail-app";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  return <EventDetailApp eventId={id} />;
}
