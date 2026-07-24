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
  "FOR REVIEW": "forwarded_frec_final",
  "APPROVED": "completed",
  "COMPLETED": "completed",
};

export default function RequestProgress({ modeStr, mode: modeProp, status, compact = false }) {
  let mode = 1;
  if (modeProp) {
    mode = parseInt(modeProp);
  } else if (modeStr) {
    mode = modeStr === "Mode 3" ? 3 : modeStr === "Mode 2" ? 2 : 1;
  }
  
  const stages = mode === 3
    ? [
        { k: "submitted", l: "Student" },
        { k: "approved_adviser", l: "Adviser" },
        { k: "forwarded_frec", l: "FREC" },
        { k: "forwarded_dean", l: "Dean" },
        { k: "forwarded_frec_final", l: "FREC" },
        { k: "cert_generated", l: "Certificate" },
        { k: "completed", l: "FREC" }
      ]
    : mode === 2
    ? [
        { k: "submitted", l: "Student" },
        { k: "approved_adviser", l: "Adviser" },
        { k: "forwarded_frec", l: "FREC" },
        { k: "cert_generated", l: "Certificate" },
        { k: "forwarded_pc", l: "Prog. Chair" },
        { k: "forwarded_dean", l: "Dean" },
        { k: "completed", l: "Done" }
      ]
    : [
        { k: "submitted", l: "Student" },
        { k: "approved_adviser", l: "Adviser" },
        { k: "forwarded_frec", l: "FREC" },
        { k: "cert_generated", l: "Certificate" },
        { k: "forwarded_pc", l: "Prog. Chair" },
        { k: "completed", l: "Done" }
      ];

  const statusKey = STATUS_TO_KEY[status] || "submitted";
  const stageIndex = stages.findIndex(s => s.k === statusKey);
  
  let currentStep = stageIndex >= 0 ? stageIndex + 1 : 1;
  if (statusKey === "completed") {
    currentStep = stages.length;
  }
  if (status?.includes("DISAPPROVED")) {
    currentStep = stageIndex >= 0 ? stageIndex + 1 : 1;
  }

  const containerPad = compact ? "px-2 py-3 bg-slate-50/50" : "px-6 py-5 bg-[#f8fafc]";
  const checkIconSize = compact ? 10 : 12;
  const labelText = compact ? "text-[9px]" : "text-[11px]";
  const circleWrapperClass = compact ? "w-[42px] shrink-0" : "w-[64px] shrink-0";
  const lineOffsetStyle = compact ? { marginBottom: "14px" } : { marginBottom: "18px" };

  return (
    <div className={`w-full rounded-lg ${containerPad}`}>
      <div className="flex items-center w-full">
        {stages.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep - 1;
          
          let bgColor = "#E5E7EB";
          let textColor = "#9CA3AF";
          if (isCompleted) {
            bgColor = "#7B1113";
            textColor = "#fff";
          } else if (isCurrent) {
            bgColor = "#D4890A";
            textColor = "#fff";
          }

          return (
            <div key={step.k} className="flex items-center flex-1 min-w-0 last:flex-initial">
              {/* Circle & Label wrapper */}
              <div className={`flex flex-col items-center gap-1 ${circleWrapperClass}`}>
                <div
                  className="rounded-full flex items-center justify-center font-bold"
                  style={{
                    width: compact ? "1.5rem" : "1.75rem",
                    height: compact ? "1.5rem" : "1.75rem",
                    backgroundColor: bgColor,
                    color: textColor,
                    fontSize: compact ? "10px" : "12px",
                  }}
                >
                  {isCompleted ? (
                    <svg width={checkIconSize} height={checkIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`${labelText} text-center leading-tight font-medium text-slate-500`}>
                  {step.l}
                </span>
              </div>
              
              {/* Connector line */}
              {index < stages.length - 1 && (
                <div 
                  className="flex-1 h-0.5 mx-1"
                  style={{ 
                    backgroundColor: isCompleted ? "#7B1113" : "#E5E7EB",
                    ...lineOffsetStyle
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
