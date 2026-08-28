import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      {Children.map(children, (child, i) =>
        isValidElement(child) ? cloneElement(child as ReactElement<{ variant?: number }>, { variant: i % 4 }) : child,
      )}
    </div>
  );
}
