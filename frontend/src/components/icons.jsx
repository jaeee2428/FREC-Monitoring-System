import React from "react";

/* ---------- Inline SVG icons (no external icon library needed) ---------- */

const IconBase = ({ children, size = 18, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {children}
    </svg>
);

export const HomeIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 9.5 12 3l9 6.5" />
        <path d="M5 9.5V21h14V9.5" />
    </IconBase>
);

export const FileTextIcon = (props) => (
    <IconBase {...props}>
        <path d="M6 2h9l5 5v15H6z" />
        <path d="M14 2v6h6" />
    </IconBase>
);

export const CheckCircleIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.3 2.3L16 10" />
    </IconBase>
);

export const RotateIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 12a9 9 0 1 1 3 6.7" />
        <path d="M3 21v-6h6" />
    </IconBase>
);

export const LogOutIcon = (props) => (
    <IconBase {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
    </IconBase>
);

export const BellIcon = (props) => (
    <IconBase {...props}>
        <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
        <path d="M10.5 20a1.5 1.5 0 0 0 3 0" />
    </IconBase>
);

export const PlusIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 5v14M5 12h14" />
    </IconBase>
);

export const XCircleIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="m9.5 9.5 5 5m0-5-5 5" />
    </IconBase>
);

export const ArrowRightCircleIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12h6m0 0-2.5-2.5M15 12l-2.5 2.5" />
    </IconBase>
);

export const InfoIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
    </IconBase>
);

export const EyeIcon = (props) => (
    <IconBase {...props}>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
    </IconBase>
);
