import { useEffect, useMemo, useState } from "react";

import { listScenarios } from "../services/supabase/scenarios";
import { Scenario } from "../types/scenario";

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listScenarios()
      .then(setScenarios)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(
    () => ({
      "Alltag & Smalltalk": scenarios.filter((item) => ["Smalltalk", "Alltag"].includes(item.category)),
      Karriere: scenarios.filter((item) => ["Bewerbung", "Gehalt", "Karriere"].includes(item.category)),
      "Konflikt & Schwierige Gespräche": scenarios.filter((item) =>
        ["Konflikt", "Schwierige Gespräche"].includes(item.category)
      ),
      Führung: scenarios.filter((item) => item.category === "Führung"),
      "Dating & Beziehungen": scenarios.filter((item) => item.category === "Dating")
    }),
    [scenarios]
  );

  return { scenarios, grouped, loading, error };
}
