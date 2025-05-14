
import {
  toast as sonnerToast,
  type ToastT,
} from "sonner";

export type ToastProps = ToastT & {
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

// Re-export the useToaster hook from sonner (not useToast)
export { useToaster as useToast } from "sonner";
