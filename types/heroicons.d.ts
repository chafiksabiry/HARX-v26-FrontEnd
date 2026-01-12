declare module '@heroicons/react/24/outline' {
  import { FC, SVGProps } from 'react';
  export const XMarkIcon: FC<SVGProps<SVGSVGElement>>;
  export const CheckIcon: FC<SVGProps<SVGSVGElement>>;
  export const ChevronDownIcon: FC<SVGProps<SVGSVGElement>>;
  export const ChevronUpIcon: FC<SVGProps<SVGSVGElement>>;
  export const PlusIcon: FC<SVGProps<SVGSVGElement>>;
  export const MinusIcon: FC<SVGProps<SVGSVGElement>>;
  export const TrashIcon: FC<SVGProps<SVGSVGElement>>;
  export const PencilIcon: FC<SVGProps<SVGSVGElement>>;
  export const EyeIcon: FC<SVGProps<SVGSVGElement>>;
  export const EyeSlashIcon: FC<SVGProps<SVGSVGElement>>;
  // Add other icons as needed - using a catch-all for any icon name
  [key: string]: FC<SVGProps<SVGSVGElement>>;
}
