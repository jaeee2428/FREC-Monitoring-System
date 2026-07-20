import { InfoIcon } from "./icons.jsx";

const MODES = [
    {
        title: "Mode 1",
        route: "Certification — Return to Adviser → PC",
        headerColor: "text-[#7a1f2b]",
        steps: [
            { label: "Student", sub: "" },
            { label: "Adviser", sub: "(Approve, Mode 1)" },
            { label: "FREC", sub: "(Approve)" },
            { label: "Generate Certificate", sub: "" },
            { label: "Return to Adviser", sub: "" },
            { label: "Program Chair", sub: "" },
        ],
    },
    {
        title: "Mode 2",
        route: "Certification — Return to PC → Dean",
        headerColor: "text-[#7a1f2b]",
        steps: [
            { label: "Student", sub: "" },
            { label: "Adviser", sub: "(Approve, Mode 2)" },
            { label: "FREC", sub: "(Approve)" },
            { label: "Generate Certificate", sub: "" },
            { label: "Program Chair", sub: "" },
            { label: "Dean", sub: "" },
        ],
    },
    {
        title: "Mode 3",
        route: "Endorsement — Forward to Dean → Reviewer → FICS FREC",
        headerColor: "text-[#7a1f2b]",
        steps: [
            { label: "Student", sub: "" },
            { label: "Adviser", sub: "(Approve, Mode 3)" },
            { label: "FREC", sub: "(Approve)" },
            { label: "Dean", sub: "(Endorsement Letter)" },
            { label: "Reviewer", sub: "" },
            { label: "Generate Certificate", sub: "" },
            { label: "FICS FREC", sub: "" },
        ],
    },
];

function StepNode({ num, step, isLast }) {
    if (isLast) {
        return (
            <div className="flex flex-col items-center shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm">
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                </div>
                <span className="mt-1.5 text-[10px] font-semibold text-emerald-600 whitespace-nowrap leading-tight">Completed</span>
                <span className="text-[9px] text-transparent whitespace-nowrap leading-tight">{'\u00A0'}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7a1f2b] text-xs font-bold text-white shadow-sm">
                {num}
            </div>
            <span className="mt-1.5 text-[10px] font-semibold text-slate-700 whitespace-nowrap leading-tight">{step.label}</span>
            <span className="text-[9px] text-slate-400 whitespace-nowrap leading-tight">{step.sub || '\u00A0'}</span>
        </div>
    );
}

function Connector() {
    return <div className="h-px w-6 bg-slate-200 shrink-0 mx-1.5 self-center" />;
}

function ModeCard({ mode }) {
    const totalSteps = mode.steps.length + 1;

    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-5">
            <div className="mb-5">
                <span className={`text-xs font-bold ${mode.headerColor} uppercase tracking-wider`}>{mode.title}</span>
                <span className="ml-2 text-sm font-semibold text-slate-800">{mode.route}</span>
            </div>

            <div className="flex items-center overflow-x-auto pb-2">
                {mode.steps.map((step, i) => (
                    <div key={i} className="flex items-center shrink-0">
                        <StepNode num={i + 1} step={step} />
                        <Connector />
                    </div>
                ))}
                <StepNode num={totalSteps} isLast />
            </div>
        </div>
    );
}

export default function WorkflowGuide() {
    return (
        <div className="space-y-5 pb-8">
            <div className="flex items-start gap-2 rounded-lg border !border-blue-200 !bg-blue-50 px-4 py-3 text-xs !text-blue-700">
                <InfoIcon size={14} className="mt-0.5 shrink-0 !text-blue-400" />
                <p>
                    The certification workflow has three modes. The mode is selected by the Adviser when forwarding to FREC. Each mode determines the routing path for the generated certificate.
                </p>
            </div>

            <div className="space-y-4">
                {MODES.map((mode) => (
                    <ModeCard key={mode.title} mode={mode} />
                ))}
            </div>
        </div>
    );
}
