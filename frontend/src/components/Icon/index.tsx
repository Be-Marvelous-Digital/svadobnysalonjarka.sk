interface IconProps {
    size?: number;
    className?: string;
}

const base = (size: number) => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false as const,
});

export const MailIcon = ({ size = 14, className }: IconProps) => (
    <svg {...base(size)} className={className}>
        <rect x="2" y="4.5" width="20" height="15" rx="1.5" />
        <path d="m22 6.5-10 7-10-7" />
    </svg>
);

export const PhoneIcon = ({ size = 14, className }: IconProps) => (
    <svg {...base(size)} className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

export const CalendarIcon = ({ size = 20, className }: IconProps) => (
    <svg {...base(size)} className={className}>
        <rect x="3" y="4.5" width="18" height="16" rx="1.5" />
        <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
    </svg>
);

export const DressIcon = ({ size = 20, className }: IconProps) => (
    <svg {...base(size)} className={className}>
        <path d="M12 3a2 2 0 1 1 2 2c-.6.5-1 1-1 2v.5" />
        <path d="M12 8.5 3 15.2A2 2 0 0 0 4.2 19h15.6a2 2 0 0 0 1.2-3.8Z" />
    </svg>
);

export const CheckIcon = ({ size = 13, className }: IconProps) => (
    <svg {...base(size)} className={className} strokeWidth={1.8}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

export const PinIcon = ({ size = 16, className }: IconProps) => (
    <svg {...base(size)} className={className}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);
