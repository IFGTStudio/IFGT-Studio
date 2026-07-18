"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapJob } from "@/lib/cms";
import { useLocale } from "@/hooks/useLocale";
import { uiLabels } from "@/lib/i18n";
import type { Job } from "@/types";

export function LiveJobs() {
  const locale = useLocale();
  const ui = uiLabels[locale];
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      const supabase = createClient();
      if (!supabase) {
        setJobs([]);
        return;
      }

      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      setJobs((data ?? []).map((job: Record<string, unknown>) => mapJob(job, locale)));
    };

    void loadJobs();
  }, [locale]);

  if (jobs === null) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[.03] p-6 animate-pulse">
            <div className="h-4 w-28 rounded bg-white/10" />
            <div className="mt-4 h-7 w-3/4 rounded bg-white/10" />
            <div className="mt-3 h-4 w-1/2 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-500">
        {ui.noJobs}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <a
          key={job.id}
          href={job.apply_url || "mailto:careers@ifgt.studio"}
          target={job.apply_url ? "_blank" : undefined}
          rel={job.apply_url ? "noreferrer" : undefined}
          className="group block rounded-2xl border border-white/10 bg-white/[.03] p-6 transition hover:border-blue-500/50 hover:bg-blue-500/[.05]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-blue-400">{job.team}</p>
              <h3 className="mt-2 font-display text-2xl tracking-[-.04em]">{job.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  {job.location}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">{job.description}</p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
              {ui.apply} <ArrowUpRight size={15} className="transition group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
