// AuthProvider now lives at the root layout (src/app/layout.tsx), so auth state
// is shared across the whole app. This group layout is just a pass-through.
export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
