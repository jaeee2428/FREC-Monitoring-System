

const STATUS_TO_KEY = {
  "SUBMITTED": "submitted",
  "UNDER REVIEW": "submitted", 
  "ADVISER APPROVED": "approved_adviser",
  "FORWARDED-FREC": "forwarded_frec",
  "FREC APPROVED": "forwarded_frec", 
  "CERT GENERATED": "cert_generated",
  "FORWARDED-PC": "forwarded_pc",
  "PC APPROVED": "forwarded_pc",
  "FORWARDED-DEAN": "forwarded_dean",
  "DEAN ENDORSED": "forwarded_dean",
  "FOR REVIEW": "forwarded_reviewer",
  "APPROVED": "completed",
  "COMPLETED": "completed",
};

export default function RequestProgress({ modeStr, status, compact = false }) {
  const mode = modeStr === "Mode 3" ? 3 : modeStr === "Mode 2" ? 2 : 1;
  
  const stages = mode === 3
    ? [{ k: "submitted", l: "Student" }, { k: "approved_adviser", l: "Adviser" }, { k: "forwarded_frec", l: "FREC" }, { k: "forwarded_dean", l: "Dean" }, { k: "forwarded_reviewer", l: "Reviewer" }, { k: "cert_generated", l: "Certificate" }, { k: "completed", l: "FICS FREC" }]
    : mode === 2
    ? [{ k: "submitted", l: "Student" }, { k: "approved_adviser", l: "Adviser" }, { k: "forwarded_frec", l: "FREC" }, { k: "cert_generated", l: "Certificate" }, { k: "forwarded_pc", l: "Prog. Chair" }, { k: "forwarded_dean", l: "Dean" }, { k: "completed", l: "Done" }]
    : [{ k: "submitted", l: "Student" }, { k: "approved_adviser", l: "Adviser" }, { k: "forwarded_frec", l: "FREC" }, { k: "cert_generated", l: "Certificate" }, { k: "forwarded_pc", l: "Prog. Chair" }, { k: "completed", l: "Done" }];

  const statusKey = STATUS_TO_KEY[status] || "submitted";
  const stageIndex = stages.findIndex(s => s.k === statusKey);
  
  // The current active step is the one *after* the last completed mapped status
  let currentStep = stageIndex >= 0 ? stageIndex + 1 : 1;
  
  // If the status is COMPLETED/APPROVED, we want to mark all as completed
  if (statusKey === "completed") {
    currentStep = stages.length;
  }

  // Handle disapproved state (stop progress)
  if (status?.includes("DISAPPROVED")) {
    currentStep = stageIndex >= 0 ? stageIndex + 1 : 1; // Stay on the step that disapproved it
  }

  // Sizing variants based on compact prop
  const containerPad = compact ? "px-2 py-4" : "px-6 py-8";
  const circleSize = compact ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-sm";
  const iconSize = compact ? "12" : "18";
  const labelTop = compact ? "top-7" : "top-10";
  const labelText = compact ? "text-[10px]" : "text-xs";
  const labelWidth = compact ? "w-[60px]" : "w-[100px]";
  const linePad = compact ? "px-1" : "px-4";

  return (
    <div className={`w-full bg-[#f8fafc] ${containerPad}`}>
      <div className="flex items-center justify-between">
        {stages.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === stages.length - 1;

          return (
            <div key={step.k}>
              <div className="relative flex flex-col items-center">
                {isCompleted ? (
                  <div className={`flex items-center justify-center rounded-full bg-[#7a1f2b] text-white ${circleSize}`}>
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                ) : isCurrent ? (
                  <div className={`flex items-center justify-center rounded-full bg-[#d97706] font-bold text-white ${circleSize}`}>
                    {index + 1}
                  </div>
                ) : (
                  <div className={`flex items-center justify-center rounded-full bg-[#e2e8f0] font-bold text-slate-500 ${circleSize}`}>
                    {index + 1}
                  </div>
                )}
                
                <div className={`absolute ${labelTop} ${labelWidth} text-center font-medium text-slate-500 ${labelText} leading-tight`}>
                  {step.l}
                </div>
              </div>

              {!isLast && (
                <div className={`flex-1 ${linePad}`}>
                  <div 
                    className={`h-[2px] w-full ${isCompleted ? "bg-[#7a1f2b]" : "bg-[#e2e8f0]"}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
