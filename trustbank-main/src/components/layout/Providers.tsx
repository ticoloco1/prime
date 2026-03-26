'use client';
import '@/lib/i18n'; // initialize i18n globally
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartModal } from '@/components/ui/CartModal';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <CartModal />
    </QueryClientProvider>
  );
}
