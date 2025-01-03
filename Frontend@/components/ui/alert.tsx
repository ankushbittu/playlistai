  import React from 'react';

  export const Alert = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={`p-4 rounded-md bg-red-50 text-red-600 ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );

  export const AlertDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
);