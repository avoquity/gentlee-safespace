
import {
  toast as sonnerToast,
  ToastOptions as SonnerToastOptions,
} from "sonner";

export type ToastProps = SonnerToastOptions & {
  title?: string;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function toast({
  title,
  description,
  action,
  ...props
}: ToastProps) {
  sonnerToast(title, {
    description,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    ...props,
  });
}

export { useToast } from "sonner";
