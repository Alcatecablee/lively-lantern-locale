
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Info, ChevronDown } from "lucide-react";

export function HowToDropDown() {
  return (
    <Accordion type="single" collapsible className="w-full mb-4" defaultValue="howto">
      <AccordionItem value="howto" className="border-0 rounded-lg shadow-none bg-[#1a1d27]">
        <AccordionTrigger className="flex gap-2 items-center px-4 py-3 rounded-lg text-white text-base xs:text-lg font-semibold bg-[#23233b] hover:bg-[#262944] transition shadow active:scale-99 touch-manipulation focus-visible:ring-2 focus-visible:ring-blue-400">
          <Info className="w-5 h-5 text-blue-300 mr-2 flex-shrink-0" />
          <span>How does this work?</span>
          <ChevronDown className="w-4 h-4 text-blue-200 ml-auto" />
        </AccordionTrigger>
        <AccordionContent className="bg-[#20212D] rounded-b-lg text-sm xs:text-base text-gray-200 px-4 py-3 border-t border-[#22242B]">
          <ol className="list-decimal pl-5 pr-1 space-y-2">
            <li>
              <b>Choose layers:</b> Pick which AI cleanup steps (layers) you want. Beginners can just leave the defaults!
            </li>
            <li>
              <b>Add your code:</b> Either <span className="font-bold text-purple-300">drop a file</span> or <span className="font-bold text-purple-300">paste code</span> in the box.
            </li>
            <li>
              <b>Let NeuroLint do the work:</b> The AI will upgrade, fix, and modernize your code. Review changes below!
            </li>
          </ol>
          <div className="mt-3 p-3 rounded bg-blue-950/70 text-xs text-blue-200 border-l-4 border-blue-600">
            <b>Tips:</b> 
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>🤖 <b>Layers</b> are optional AI helpers—hover each for a quick explanation!</li>
              <li>🟢 <b>Beginners:</b> Use the default settings for best results.</li>
              <li>💡 <b>Mobile:</b> All steps are touch and paste-friendly!</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
