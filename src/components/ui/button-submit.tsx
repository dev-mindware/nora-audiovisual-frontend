import { ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "../common";

type Props = React.ComponentProps<typeof Button> & {
  isLoading: boolean;
  children?: ReactNode;
  className?: string;
};

export function ButtonSubmit({ isLoading, children, className, disabled, ...props }: Props) {
  return (
    <Button
      disabled={isLoading || disabled}
      type="submit"
      className={`w-full font-semibold rounded-xs ${className || ''}`}
      {...props}
    >
      {isLoading && <Icon className="animate-spin" name="LoaderCircle" />}
      {children}
    </Button>
  );
}
