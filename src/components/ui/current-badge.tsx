import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

import { Badge } from './badge';

export function CurrentBadge({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <Badge
      variant="accent"
      className="text-foreground"
      style={{
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
      }}
    >
      <Check size={12} aria-hidden="true" />
      {children}
    </Badge>
  );
}
