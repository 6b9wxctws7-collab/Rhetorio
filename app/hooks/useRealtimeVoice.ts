import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { recordVoiceUsage, startRealtimeVoice } from "../services/realtime/realtimeClient";
import { RealtimeEvent, RealtimeMode, RealtimeVoiceConnection } from "../services/realtime/realtimeTypes";
import { createMessage } from "../services/supabase/messages";
import { getVoiceOption } from "../services/voicePreference";
import { Scenario } from "../types/scenario";

type Options = {
  sessionId?: string;
  scenario?: Scenario | null;
  voiceId?: string;
};

const maxReconnectAttempts = 2;
const resumeTranscriptMaxEntries = 12;

export function useRealtimeVoice({ sessionId, scenario, voiceId }: Options = {}) {
  const [mode, setMode] = useState<RealtimeMode>("idle");
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<RealtimeVoiceConnection | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | undefined>(sessionId);
  const persistedAssistantItemsRef = useRef<Set<string>>(new Set());
  const persistedUserItemsRef = useRef<Set<string>>(new Set());
  const transcriptRef = useRef<{ role: "user" | "assistant"; text: string }[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const stoppingRef = useRef(false);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const supported = Platform.OS === "web";
  const connected = mode === "connected" || mode === "speaking";

  async function connect(resumeTranscript?: string) {
    const voiceOption = getVoiceOption(voiceId);
    connectionRef.current = await startRealtimeVoice({
      sessionId,
      scenario,
      voiceId: voiceOption.id,
      voiceGender: voiceOption.gender,
      resumeTranscript,
      onModeChange: setMode,
      onEvent: handleEvent
    });
  }

  function handleEvent(event: RealtimeEvent) {
    setEvents((current) => [event, ...current].slice(0, 30));
    persistTranscript(event);

    if (event.type === "session.ready") {
      reconnectAttemptsRef.current = 0;
      return;
    }

    if (event.type === "connection.lost" && !stoppingRef.current) {
      void reconnect();
    }
  }

  async function reconnect() {
    connectionRef.current?.stop();
    connectionRef.current = null;

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setMode("error");
      setError("Die Verbindung wurde unterbrochen. Tippe auf die Kugel, um fortzusetzen.");
      return;
    }
    reconnectAttemptsRef.current += 1;
    setMode("connecting");

    const recent = transcriptRef.current.slice(-resumeTranscriptMaxEntries);
    const resumeTranscript = recent.length
      ? recent.map((entry) => `${entry.role === "user" ? "Nutzer" : "Du"}: ${entry.text}`).join("\n")
      : undefined;

    try {
      await connect(resumeTranscript);
    } catch (err) {
      setMode("error");
      setError(err instanceof Error ? err.message : "Verbindung konnte nicht wiederhergestellt werden.");
    }
  }

  async function start() {
    if (!supported) {
      setError("Live Voice ist für native iOS/Android vorbereitet, aber in diesem MVP zuerst im Web testbar.");
      setMode("error");
      return;
    }

    setError(null);
    stoppingRef.current = false;
    reconnectAttemptsRef.current = 0;
    startedAtRef.current = Date.now();
    try {
      persistedAssistantItemsRef.current = new Set();
      persistedUserItemsRef.current = new Set();
      transcriptRef.current = [];
      await connect();
    } catch (err) {
      setMode("error");
      setError(err instanceof Error ? err.message : "Live Voice konnte nicht gestartet werden.");
    }
  }

  function persistTranscript(event: RealtimeEvent) {
    const targetSessionId = sessionIdRef.current;

    if (event.type === "conversation.item.input_audio_transcription.completed") {
      const itemId = typeof event.item_id === "string" ? event.item_id : null;
      const transcript = typeof event.transcript === "string" ? event.transcript.trim() : "";
      if (!transcript || (itemId && persistedUserItemsRef.current.has(itemId))) return;
      if (itemId) persistedUserItemsRef.current.add(itemId);
      transcriptRef.current.push({ role: "user", text: transcript });
      if (targetSessionId) void createMessage(targetSessionId, "user", transcript).catch(() => undefined);
      return;
    }

    if (event.type === "response.audio_transcript.done" || event.type === "response.output_audio_transcript.done") {
      const itemId = typeof event.item_id === "string" ? event.item_id : null;
      const transcript = typeof event.transcript === "string" ? event.transcript.trim() : "";
      if (!transcript || (itemId && persistedAssistantItemsRef.current.has(itemId))) return;
      if (itemId) persistedAssistantItemsRef.current.add(itemId);
      transcriptRef.current.push({ role: "assistant", text: transcript });
      if (targetSessionId) void createMessage(targetSessionId, "assistant", transcript).catch(() => undefined);
    }
  }

  async function stop() {
    stoppingRef.current = true;
    const endedAt = Date.now();
    const startedAt = startedAtRef.current;
    connectionRef.current?.stop();
    connectionRef.current = null;
    startedAtRef.current = null;
    setMode("idle");

    if (startedAt) {
      try {
        await recordVoiceUsage(sessionIdRef.current, startedAt, endedAt);
      } catch {
        // Voice usage should not block the user from finishing a session.
      }
    }
  }

  async function toggle() {
    if (connected || mode === "connecting") await stop();
    else await start();
  }

  useEffect(() => {
    return () => {
      stoppingRef.current = true;
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
  }, []);

  return {
    mode,
    events,
    error,
    supported,
    connected,
    start,
    stop,
    toggle
  };
}
