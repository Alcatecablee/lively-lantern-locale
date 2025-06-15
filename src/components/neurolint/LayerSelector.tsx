import React from "react";
import { LAYER_LIST } from "@/lib/neurolint/orchestrator";
import { Toggle } from "@/components/ui/toggle";
import { Brain } from "lucide-react";
interface LayerSelectorProps {
  enabledLayers: number[];
  setEnabledLayers: (ids: number[]) => void;
}
export function LayerSelector({
  enabledLayers,
  setEnabledLayers
}: LayerSelectorProps) {
  const onToggle = (id: number) => {
    setEnabledLayers(enabledLayers.includes(id) ? enabledLayers.filter(l => l !== id) : [...enabledLayers, id].sort());
  };
  return <div className="w-full flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 mb-1">
        
        <span className="text-lg font-bold text-white tracking-tight">
          NeuroLint
        </span>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 w-full max-w-xs sm:max-w-sm md:max-w-lg">
        {LAYER_LIST.map(layer => {
        const isOn = enabledLayers.includes(layer.id);
        return <Toggle key={layer.id} pressed={isOn} onPressedChange={() => onToggle(layer.id)} className={`flex items-center w-full px-3 py-2 rounded-full border-2 transition
                text-sm font-semibold 
                ${isOn ? 'bg-blue-700 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-200'}
                shadow touch-manipulation select-none
                focus-visible:ring-2 focus-visible:ring-blue-400 
                active:scale-[.97]
                min-h-[44px] min-w-[0px]
                `} aria-pressed={isOn} type="button" tabIndex={0}>
              <span className={`inline-flex items-center justify-center w-9 h-9 text-base font-bold rounded-full mr-2 border
                  ${isOn ? "bg-white/30 text-blue-100 border-blue-200" : "bg-white text-blue-700 border-gray-300"}
                  `}>
                {layer.id}
              </span>
              <span className="whitespace-nowrap truncate text-left">
                {layer.name}
              </span>
            </Toggle>;
      })}
      </div>
    </div>;
}