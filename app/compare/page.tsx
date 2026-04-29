"use client";
import ComingSoon from "@/components/ComingSoon";
export default function ComparePage() {
  return (
    <ComingSoon
      icon="🔀"
      title="Compare PDF"
      description="Highlight the differences between two PDF documents — text changes, added or removed pages."
      reason="Accurate document diffing requires server-side rendering and diff algorithms that are too large for browser use."
    />
  );
}
