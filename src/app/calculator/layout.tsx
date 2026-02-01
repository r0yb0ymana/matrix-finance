/**
 * Calculator Layout
 *
 * Wraps calculator page with ApplicationProvider
 */

import { ApplicationProvider } from "@/contexts/ApplicationContext";

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicationProvider>{children}</ApplicationProvider>;
}
