"use client";

/**
 * useClassConfig — fetches the class_config table to determine
 * which classes are active vs coming soon.
 * Falls back to sprout_1 only if the table doesn't exist yet.
 */
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ClassConfig, ClassLevel } from "@/types";

const FALLBACK: ClassConfig[] = [
  { class: "sprout_1",      active: true,  launch_date: null },
  { class: "sprout_2",      active: false, launch_date: null },
  { class: "sprout_3",      active: false, launch_date: null },
  { class: "stepping_stone",active: false, launch_date: null },
];

export function useClassConfig() {
  const supabase = createClient();
  const [configs, setConfigs] = useState<ClassConfig[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("class_config")
        .select("class, active, launch_date")
        .order("class");
      if (!cancelled && data && data.length > 0) {
        setConfigs(data as ClassConfig[]);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isClassActive(cls: ClassLevel): boolean {
    return configs.find(c => c.class === cls)?.active ?? false;
  }

  return { configs, loading, isClassActive };
}
