'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavLinkProps {
    href: string;
    end?: boolean;
    className?: string;
    onClick?: () => void;
    children: ReactNode;
}

export const NavLink = ({ href, end = false, className, onClick, children }: NavLinkProps) => {
    const pathname = usePathname();
    const active = end ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link href={href} className={className} onClick={onClick} aria-current={active ? 'page' : undefined}>
            {children}
        </Link>
    );
};
