import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [
        {
          shadow: [
            "ring-2xs",
            "ring-xs",
            "ring-sm",
            "ring-md",
            "ring-input",
            "ring-hard-md",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
