'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLink = { href: string; label: string };

// trailingSlash:true means usePathname() returns e.g. "/patches/" (basePath
// is already stripped by Next). Drop the trailing slash so it compares
// evenly against href values like "/patches".
function normalize(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export default function SiteNav({ links }: { links: NavLink[] }) {
  const current = normalize(usePathname());

  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {links.map(({ href, label }) => {
        const target = normalize(href);
        // Sub-routes count as active too, e.g. a patch detail page keeps
        // "Contributions" highlighted.
        const active = current === target || current.startsWith(`${target}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3 py-1.5 ${
              active
                ? 'bg-primary-weak text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-m2'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
