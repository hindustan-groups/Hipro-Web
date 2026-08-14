import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // @ts-ignore
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent {...props} />;
}
