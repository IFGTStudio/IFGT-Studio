import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-5">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white">
          <ArrowLeft size={16} /> Ana sayfaya dön
        </Link>
        <h1 className="mt-8 font-display text-4xl">Kullanım Şartları</h1>
        <p className="mt-6 text-zinc-300">
          Bu sayfaya Kullanım Şartları metnini ekleyebilirsiniz.
        </p>
      </div>
    </main>
  );
}
