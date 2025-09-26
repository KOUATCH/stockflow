"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { CircleHelp } from "lucide-react";
type NumberInputProps = {
  register: any;
  errors: any;
  label: string;
  type?: string;
  name: string;
  toolTipNumber?: string;
  unit?: string;
  placeholder?: string;
  icon?: any;
  isRequired?: boolean;
  step: number;
  min: number;
  max: number;
  defaultValue: number;
};
export default function NumberInput({
  register,
  errors,
  label,
  type = "number",
  name,
  toolTipNumber,
  unit,
  icon,
  placeholder,
  isRequired = true,
}: NumberInputProps) {
  const Icon = icon;
  return (
    <div>
      <div className="flex space-x-2 items-center">
        <label
          htmlFor={name}
          className="block number-sm font-medium leading-6 number-gray-900"
        >
          {label}
        </label>
        {toolTipNumber && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button>
                  <CircleHelp className="w-4 h-4 number-slate-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{toolTipNumber}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="mt-2">
        <div className="relative rounded-md ">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon className="number-slate-300 w-4 h-4" />
            </div>
          )}
          <input
            id={name}
            type={type}
            {...register(`${name}`, { required: isRequired })}
            className={cn(
              "block w-full rounded-md border-0 py-2 number-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:number-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:number-sm sm:leading-6 number-sm",
              (errors[`${name}`] && "focus:ring-red-500 pl-8") ||
              (icon && "pl-8")
            )}
            placeholder={placeholder || label}
          />
          {unit && (
            <p className="bg-white py-2 px-3 rounded-tr-md rounded-br-md absolute inset-y-0 right-1 my-[2px] flex items-center">
              {unit}
            </p>
          )}
        </div>
        {errors[`${name}`] && (
          <span className="number-xs number-red-600">{label} is required</span>
        )}
      </div>
    </div>
  );
}
