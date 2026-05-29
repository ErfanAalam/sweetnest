import { AuthProvider } from '@/lib/auth-context';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
