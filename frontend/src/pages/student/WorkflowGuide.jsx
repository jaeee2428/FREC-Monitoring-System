import React from "react";

const WORKFLOW_MODES = [
  {
    mode: 1,
    accent: "text-violet-700",
    title: "Certification — Return to Adviser → PC",
    steps: [
      "Student",
      "Adviser (Approve, Mode 1)",
      "FREC (Approve)",
      "Generate Certificate",
      "Return to Adviser",
      "Program Chair",
      "Completed",
    ],
    highlightSteps: [4, 7],
  },
  {
    mode: 2,
    accent: "text-blue-700",
    title: "Certification — Return to PC → Dean",
    steps: [
      "Student",
      "Adviser (Approve, Mode 2)",
      "FREC (Approve)",
      "Generate Certificate",
      "Program Chair",
      "Dean",
      "Completed",
    ],
    highlightSteps: [4, 7],
  },
  {
    mode: 3,
    accent: "text-orange-700",
    title: "Endorsement — Forward to Dean → Reviewer → FICS FREC",
    steps: [
      "Student",
      "Adviser (Approve, Mode 3)",
      "FREC (Approve)",
      "Dean (Endorsement Letter)",
      "Reviewer",
      "Generate Certificate",
      "FICS FREC",
      "Completed",
    ],
    highlightSteps: [6],
  },
];

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

function WorkflowModeCard({ mode }) {
  return (
    <section className="rounded border border-slate-200 bg-white px-7 py-6">
      <div className="mb-7 flex items-center gap-7">
        <span className={`font-mono text-sm font-semibold ${mode.accent}`}>Mode {mode.mode}</span>
        <h2 className="!m-0 !text-base !font-bold !text-slate-900">{mode.title}</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[760px] items-start">
          {mode.steps.map((step, index) => (
            <WorkflowStep
              key={step}
              number={index + 1}
              label={step}
              highlighted={mode.highlightSteps.includes(index + 1)}
              isLast={index === mode.steps.length - 1}
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
      {WORKFLOW_MODES.map((mode) => (
        <WorkflowModeCard key={mode.mode} mode={mode} />
      ))}
    </div>
  );
}
