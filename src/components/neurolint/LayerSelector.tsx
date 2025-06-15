import React from "react";
import { LAYER_LIST } from "@/lib/neurolint/orchestrator";
import { Badge } from "@/components/ui/badge";

// Keep mobile/touch in mind
interface LayerSelectorProps {
  enabledLayers: number[];
  setEnabledLayers: (ids: number[]) => void;
}

export function LayerSelector({ enabledLayers, setEnabledLayers }: LayerSelectorProps) {
  // Toggle handler
  const onToggle = (id: number) => {
    setEnabledLayers(
      enabledLayers.includes(id)
        ? enabledLayers.filter(l => l !== id)
        : [...enabledLayers, id].sort()
    );
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center py-2">
      {LAYER_LIST.map(layer => (
        <button
          key={layer.id}
          className={`rounded-full px-3 py-2 flex items-center gap-2 text-xs font-semibold
            ${enabledLayers.includes(layer.id)
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-200 text-gray-800"
            } transition-colors active:scale-95 touch-manipulation`}
          type="button"
          aria-pressed={enabledLayers.includes(layer.id)}
          onClick={() => onToggle(layer.id)}
        >
          <Badge 
            variant={enabledLayers.includes(layer.id) ? "default" : "outline"}
            className="mr-2"
          >{layer.id}</Badge>
          {layer.name}
        </button>
      ))}
    </div>
  );
}
