import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-serif text-2xl font-semibold tracking-wide text-white ${className}`}>
      {siteConfig.logo.main} <span className="italic text-gold">{siteConfig.logo.accent}</span>
    </Link>
  );
}
