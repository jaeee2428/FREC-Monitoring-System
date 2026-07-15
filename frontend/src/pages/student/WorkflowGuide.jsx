import React from "react";
import { InfoIcon } from "../../components/icons";

function WorkflowStep({ number, label, highlighted, isLast }) {
  return (
    <div className="flex min-w-[100px] flex-1 items-start">
      <div className="flex flex-1 flex-col items-center text-center">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
            highlighted ? "bg-[#7a1f2b]" : "bg-slate-700"
          }`}
        >
          {number}
        </span>
        <span className="mt-2 max-w-[110px] text-xs leading-snug text-slate-600">
          {label}
        </span>
      </div>

      {!isLast && <div className="mt-4 h-px w-7 bg-slate-200" />}
    </div>
  );
}

const STEPS_MODE_1 = [
  "Student",
  "Adviser (Approve, Mode 1)",
  "FREC (Approve)",
  "Generate Certificate",
  "Return to Adviser",
  "Program Chair",
  "Completed",
];
const HIGHLIGHT_MODE_1 = [4, 7];

function WorkflowMode1Card() {
  return (
    <section className="rounded border border-slate-200 bg-white px-7 py-6">
      <div className="mb-7 flex items-center gap-7">
        <span className="font-mono text-sm font-semibold text-violet-700">Mode 1</span>
        <h2 className="!m-0 !text-base !font-bold !text-slate-900">
          Certification — Return to Adviser → PC
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[760px] items-start">
          {STEPS_MODE_1.map((step, index) => (
            <WorkflowStep
              key={step}
              number={index + 1}
              label={step}
              highlighted={HIGHLIGHT_MODE_1.includes(index + 1)}
              isLast={index === STEPS_MODE_1.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS_MODE_2 = [
  "Student",
  "Adviser (Approve, Mode 2)",
  "FREC (Approve)",
  "Generate Certificate",
  "Program Chair",
  "Dean",
  "Completed",
];
const HIGHLIGHT_MODE_2 = [4, 7];

function WorkflowMode2Card() {
  return (
    <section className="rounded border border-slate-200 bg-white px-7 py-6">
      <div className="mb-7 flex items-center gap-7">
        <span className="font-mono text-sm font-semibold text-blue-700">Mode 2</span>
        <h2 className="!m-0 !text-base !font-bold !text-slate-900">
          Certification — Return to PC → Dean
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[760px] items-start">
          {STEPS_MODE_2.map((step, index) => (
            <WorkflowStep
              key={step}
              number={index + 1}
              label={step}
              highlighted={HIGHLIGHT_MODE_2.includes(index + 1)}
              isLast={index === STEPS_MODE_2.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS_MODE_3 = [
  "Student",
  "Adviser (Approve, Mode 3)",
  "FREC (Approve)",
  "Dean (Endorsement Letter)",
  "Reviewer",
  "Generate Certificate",
  "FICS FREC",
  "Completed",
];
const HIGHLIGHT_MODE_3 = [6];

function WorkflowMode3Card() {
  return (
    <section className="rounded border border-slate-200 bg-white px-7 py-6">
      <div className="mb-7 flex items-center gap-7">
        <span className="font-mono text-sm font-semibold text-orange-700">Mode 3</span>
        <h2 className="!m-0 !text-base !font-bold !text-slate-900">
          Endorsement — Forward to Dean → Reviewer → FICS FREC
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[760px] items-start">
          {STEPS_MODE_3.map((step, index) => (
            <WorkflowStep
              key={step}
              number={index + 1}
              label={step}
              highlighted={HIGHLIGHT_MODE_3.includes(index + 1)}
              isLast={index === STEPS_MODE_3.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WorkflowGuide() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <p>
          The certification workflow has three modes. The mode is selected by the Adviser when forwarding to FREC. Each mode determines the routing path for the generated certificate.
        </p>
      </div>
      <WorkflowMode1Card />
      <WorkflowMode2Card />
      <WorkflowMode3Card />
    </div>
  );
}
