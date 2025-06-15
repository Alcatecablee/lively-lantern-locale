
import React from "react";
import { LAYER_LIST } from "@/lib/neurolint/orchestrator";
import { Toggle } from "@/components/ui/toggle";
import { Brain } from "lucide-react";

interface LayerSelectorProps {
  enabledLayers: number[];
  setEnabledLayers: (ids: number[]) => void;
}

export function LayerSelector({ enabledLayers, setEnabledLayers }: LayerSelectorProps) {
  const onToggle = (id: number) => {
    setEnabledLayers(
      enabledLayers.includes(id)
        ? enabledLayers.filter(l => l !== id)
        : [...enabledLayers, id].sort()
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-6 h-6 text-purple-400" />
        <span className="text-lg font-bold text-white tracking-tight">
          NeuroLint
        </span>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 w-full max-w-xs sm:max-w-sm md:max-w-lg">
        {LAYER_LIST.map(layer => (
          <Toggle
            key={layer.id}
            pressed={enabledLayers.includes(layer.id)}
            onPressedChange={() => onToggle(layer.id)}
            className={`flex items-center w-full px-3 py-2 rounded-full border-2 transition 
              text-sm font-semibold bg-gray-100 data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-700 data-[state=on]:to-purple-500 
              data-[state=on]:text-white data-[state=on]:border-purple-400
              border-gray-200 text-gray-800 shadow touch-manipulation
              focus-visible:ring-2 focus-visible:ring-blue-400 
              active:scale-[.97] 
              min-h-[44px] min-w-[0px] select-none
            `}
            aria-pressed={enabledLayers.includes(layer.id)}
            type="button"
            tabIndex={0}
          >
            <span
              className={`inline-flex items-center justify-center w-9 h-9 text-base font-bold rounded-full mr-2 border
                ${enabledLayers.includes(layer.id)
                  ? "bg-white/30 text-purple-100 border-purple-300"
                  : "bg-white text-purple-700 border-gray-300"
                }
              `}
            >
              {layer.id}
            </span>
            <span className="whitespace-nowrap truncate text-left">
              {layer.name}
            </span>
          </Toggle>
        ))}
      </div>
    </div>
  );
}
