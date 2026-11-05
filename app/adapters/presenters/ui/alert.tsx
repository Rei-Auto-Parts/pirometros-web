import * as React from 'react';

import { cn } from '@/infra/tools/cn';

function Alert({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn('relative flex w-full flex-col gap-2 rounded-lg border p-4 text-sm', className)}
      {...props}
    />
  );
}

export { Alert };
