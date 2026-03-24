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
      <p className="text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{title}</p>
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
      <div className="bg-slate-50 w-full rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-5 border border-slate-200 shadow-sm">
        {tips.map((tip, index) => (
          <div className="flex flex-row gap-4 items-start bg-white p-4 rounded-xl border border-slate-100 shadow-sm" key={index}>
            <div className={`mt-0.5 flex-shrink-0 ${tip.type === "good" ? "text-emerald-500" : "text-amber-500"}`}>
              {tip.type === "good"
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              }
            </div>
            <p className="text-slate-700 font-medium text-sm leading-relaxed">{tip.tip}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 w-full">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={cn(
              "flex flex-col gap-3 rounded-2xl p-6 border shadow-sm",
              tip.type === "good"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            )}
          >
            <div className="flex flex-row gap-3 items-center">
              <div className={tip.type === "good" ? "text-emerald-600" : "text-amber-600"}>
                {tip.type === "good"
                  ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                }
              </div>
              <p className={`text-lg font-bold ${tip.type === "good" ? "text-emerald-900" : "text-amber-900"}`}>
                {tip.tip}
              </p>
            </div>
            <p className={`text-sm font-medium leading-relaxed pl-9 ${tip.type === "good" ? "text-emerald-800/80" : "text-amber-800/80"}`}>
                {tip.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Details = ({ feedback }: { feedback: any }) => {
  if (!feedback?.toneAndStyle && !feedback?.content && !feedback?.structure && !feedback?.skills) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 text-center">
        <p className="text-slate-500 font-medium">
          This resume was analyzed with an older version. Please upload it again to see detailed feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <h2 className="text-2xl font-extrabold text-slate-900 my-2 px-2">Detailed Breakdown</h2>
      
      <Accordion>
        {feedback.toneAndStyle && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl mb-4 overflow-hidden group transition-all hover:border-violet-300">
            <AccordionItem id="tone-style">
              <AccordionHeader itemId="tone-style" className="px-8 py-5 hover:bg-slate-50 transition-colors border-b border-slate-100">
                <CategoryHeader
                  title="Tone & Style"
                  categoryScore={feedback.toneAndStyle.score}
                />
              </AccordionHeader>
              <AccordionContent itemId="tone-style" className="px-8 pb-8 bg-white">
                <CategoryContent tips={feedback.toneAndStyle.tips} />
              </AccordionContent>
            </AccordionItem>
          </div>
        )}

        {feedback.content && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl mb-4 overflow-hidden group transition-all hover:border-violet-300">
            <AccordionItem id="content">
              <AccordionHeader itemId="content" className="px-8 py-5 hover:bg-slate-50 transition-colors border-b border-slate-100">
                <CategoryHeader
                  title="Content"
                  categoryScore={feedback.content.score}
                />
              </AccordionHeader>
              <AccordionContent itemId="content" className="px-8 pb-8 bg-white">
                <CategoryContent tips={feedback.content.tips} />
              </AccordionContent>
            </AccordionItem>
          </div>
        )}

        {feedback.structure && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl mb-4 overflow-hidden group transition-all hover:border-violet-300">
            <AccordionItem id="structure">
              <AccordionHeader itemId="structure" className="px-8 py-5 hover:bg-slate-50 transition-colors border-b border-slate-100">
                <CategoryHeader
                  title="Structure"
                  categoryScore={feedback.structure.score}
                />
              </AccordionHeader>
              <AccordionContent itemId="structure" className="px-8 pb-8 bg-white">
                <CategoryContent tips={feedback.structure.tips} />
              </AccordionContent>
            </AccordionItem>
          </div>
        )}

        {feedback.skills && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl mb-4 overflow-hidden group transition-all hover:border-violet-300">
            <AccordionItem id="skills">
              <AccordionHeader itemId="skills" className="px-8 py-5 hover:bg-slate-50 transition-colors border-b border-slate-100">
                <CategoryHeader
                  title="Skills"
                  categoryScore={feedback.skills.score}
                />
              </AccordionHeader>
              <AccordionContent itemId="skills" className="px-8 pb-8 bg-white">
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
