"use client";

import React from "react";
import * as Icons from "lucide-react";
import { LucideProps, HelpCircle } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name?: string;
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  if (!name) {
    return <HelpCircle {...props} />;
  }

  // Format name to PascalCase in case lowercase is passed (e.g. "award" -> "Award")
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = (Icons as any)[name] || (Icons as any)[pascalName] || HelpCircle;

  if (!IconComponent || (typeof IconComponent !== "function" && typeof IconComponent !== "object")) {
    return <HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
}

