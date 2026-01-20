import { cn } from "~/lib/utils";
import ScoreBadge from "~/components/ScoreBadge";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex flex-row gap-4 items-center py-2 w-full">
      <p className="text-xl font-semibold text-white">{title}</p>
      <div className="ml-auto">
        <ScoreBadge score={categoryScore} />
      </div>
    </div>
  );
};

const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-6 w-full pt-4">
      <div className="bg-slate-800/50 w-full rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-700/50">
        {tips.map((tip, index) => (
          <div className="flex flex-row gap-3 items-start" key={index}>
            <div className={`mt-1 flex-shrink-0 ${tip.type === "good" ? "text-emerald-400" : "text-amber-400"}`}>
              {tip.type === "good"
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              }
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{tip.tip}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 w-full">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={cn(
              "flex flex-col gap-2 rounded-xl p-5 border",
              tip.type === "good"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-amber-500/5 border-amber-500/20"
            )}
          >
            <div className="flex flex-row gap-3 items-center">
              <div className={tip.type === "good" ? "text-emerald-400" : "text-amber-400"}>
                {tip.type === "good"
                  ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                }
              </div>
              <p className={`text-lg font-semibold ${tip.type === "good" ? "text-emerald-100" : "text-amber-100"}`}>
                {tip.tip}
              </p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed pl-8">{tip.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Details = ({ feedback }: { feedback: any }) => {
  // Safety check - if feedback doesn't have the expected structure, show a message
  if (!feedback?.toneAndStyle && !feedback?.content && !feedback?.structure && !feedback?.skills) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400">
          This resume was analyzed with an older version. Please upload it again to see detailed feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Accordion>
        {/* Glass card wrapper for each item could be handled here or in Accordion styles. 
              Assuming AccordionItem just renders children, we add styling there. */}

        {feedback.toneAndStyle && (
          <div className="glass-card mb-4 overflow-hidden p-0">
            <AccordionItem id="tone-style">
              <AccordionHeader itemId="tone-style" className="px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5">
                <CategoryHeader
                  title="Tone & Style"
                  categoryScore={feedback.toneAndStyle.score}
                />
              </AccordionHeader>
              <AccordionContent itemId="tone-style" className="px-6 pb-6">
                <CategoryContent tips={feedback.toneAndStyle.tips} />
              </AccordionContent>
            </AccordionItem>
          </div>
        )}

        {feedback.content && (
          <div className="glass-card mb-4 overflow-hidden p-0">
            <AccordionItem id="content">
              <AccordionHeader itemId="content" className="px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5">
                <CategoryHeader
                  title="Content"
                  categoryScore={feedback.content.score}
                />
              </AccordionHeader>
              <AccordionContent itemId="content" className="px-6 pb-6">
                <CategoryContent tips={feedback.content.tips} />
              </AccordionContent>
            </AccordionItem>
          </div>
        )}

        {feedback.structure && (
          <div className="glass-card mb-4 overflow-hidden p-0">
            <AccordionItem id="structure">
              <AccordionHeader itemId="structure" className="px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5">
                <CategoryHeader
                  title="Structure"
                  categoryScore={feedback.structure.score}
                />
              </AccordionHeader>
              <AccordionContent itemId="structure" className="px-6 pb-6">
                <CategoryContent tips={feedback.structure.tips} />
              </AccordionContent>
            </AccordionItem>
          </div>
        )}

        {feedback.skills && (
          <div className="glass-card mb-4 overflow-hidden p-0">
            <AccordionItem id="skills">
              <AccordionHeader itemId="skills" className="px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5">
                <CategoryHeader
                  title="Skills"
                  categoryScore={feedback.skills.score}
                />
              </AccordionHeader>
              <AccordionContent itemId="skills" className="px-6 pb-6">
                <CategoryContent tips={feedback.skills.tips} />
              </AccordionContent>
            </AccordionItem>
          </div>
        )}
      </Accordion>
    </div>
  );
};

export default Details;
