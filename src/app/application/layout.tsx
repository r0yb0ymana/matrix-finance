/**
 * Application Layout
 *
 * Wraps application flow pages with ApplicationProvider
 */

import { ApplicationProvider } from "@/contexts/ApplicationContext";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicationProvider>{children}</ApplicationProvider>;
}
