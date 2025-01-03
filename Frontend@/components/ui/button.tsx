// components/ui/button.tsx
import React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    className={`px-4 py-2 rounded-md font-medium ${className}`}
    ref={ref}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = "Button";





// components/ui/alert.tsx
