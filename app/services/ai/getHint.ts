import { supabase } from "../supabase/client";

type GetHintInput = {
  session_id: string;
  scenario_id: string;
};

// Holt einen Formulierungsvorschlag, wenn der Nutzer im Gespräch feststeckt.
// Läuft über generate-reply im "hint"-Modus und landet NICHT in der Historie.
export async function getHint(input: GetHintInput) {
  const { data, error } = await supabase.functions.invoke<{ reply_text: string }>("generate-reply", {
    body: { ...input, latest_user_message: "", mode: "hint" }
  });

  if (error) throw error;
  return data?.reply_text ?? "";
}
