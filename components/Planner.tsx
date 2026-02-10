"use client";

import { useEffect, useMemo, useState } from "react";

type DayId =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type IntensityLevel = "Low" | "Medium" | "High";
type FocusArea = "Strength" | "Hypertrophy" | "Endurance" | "Mobility" | "Recovery";

type Exercise = {
  id: string;
  name: string;
  focus: FocusArea;
  equipment: string;
  primaryMuscles: string[];
  description: string;
};

type WorkoutExercise = {
  exerciseId: string;
  prescription: string;
};

type Workout = {
  id: string;
  title: string;
  focus: FocusArea;
  intensity: IntensityLevel;
  trainingEffect: string;
  exercises: WorkoutExercise[];
  notes?: string;
};

type ScheduledWorkout = {
  id: string;
  workoutId: string;
  timeOfDay: "Morning" | "Midday" | "Evening";
  notes?: string;
};

type PlannerState = {
  workouts: Workout[];
  schedule: Record<DayId, ScheduledWorkout[]>;
};

const STORAGE_KEY = "pulse-plan-v1";

const DAYS: { id: DayId; label: string; affirmation: string }[] = [
  { id: "monday", label: "Monday", affirmation: "Prime the week with strength" },
  { id: "tuesday", label: "Tuesday", affirmation: "Build momentum with focus" },
  { id: "wednesday", label: "Wednesday", affirmation: "Lock in your groove" },
  { id: "thursday", label: "Thursday", affirmation: "Push toward the finish" },
  { id: "friday", label: "Friday", affirmation: "Finish strong and recover smart" },
  { id: "saturday", label: "Saturday", affirmation: "Own your active recovery" },
  { id: "sunday", label: "Sunday", affirmation: "Reset the engine" }
];

const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: "front-squat",
    name: "Front Squat",
    focus: "Strength",
    equipment: "Barbell",
    primaryMuscles: ["Quads", "Core"],
    description: "Upright squat variation that targets quads and reinforces core tension."
  },
  {
    id: "rdl",
    name: "Romanian Deadlift",
    focus: "Hypertrophy",
    equipment: "Barbell",
    primaryMuscles: ["Hamstrings", "Glutes"],
    description: "Posterior-chain hinge emphasizing eccentric control and hamstring tension."
  },
  {
    id: "tempo-pushup",
    name: "Tempo Push-Up",
    focus: "Endurance",
    equipment: "Bodyweight",
    primaryMuscles: ["Chest", "Shoulders", "Triceps"],
    description: "Push-up variation performed with slow tempo to increase time under tension."
  },
  {
    id: "hang-clean",
    name: "Hang Power Clean",
    focus: "Strength",
    equipment: "Barbell",
    primaryMuscles: ["Posterior Chain", "Upper Back"],
    description: "Explosive pull from the hang position to develop power and coordination."
  },
  {
    id: "assault-bike",
    name: "Assault Bike Intervals",
    focus: "Endurance",
    equipment: "Air Bike",
    primaryMuscles: ["Full Body"],
    description: "Alternating sprint and recovery intervals to elevate VO₂ max."
  },
  {
    id: "copenhagen-plank",
    name: "Copenhagen Plank",
    focus: "Mobility",
    equipment: "Bodyweight",
    primaryMuscles: ["Adductors", "Core"],
    description: "Side plank variation targeting adductors and lateral core stability."
  },
  {
    id: "landmine-press",
    name: "Landmine Press",
    focus: "Strength",
    equipment: "Barbell",
    primaryMuscles: ["Shoulders", "Core"],
    description: "Angled press to train scapular stability and unilateral strength."
  },
  {
    id: "single-leg-row",
    name: "Single-Leg Dumbbell Row",
    focus: "Hypertrophy",
    equipment: "Dumbbell",
    primaryMuscles: ["Lats", "Glutes"],
    description: "Row variation pairing balance demand with upper-back hypertrophy focus."
  },
  {
    id: "90-90-hovers",
    name: "90/90 Hip Hovers",
    focus: "Mobility",
    equipment: "Bodyweight",
    primaryMuscles: ["Hips"],
    description: "Controlled rotation drill to unlock hip external/internal rotation."
  },
  {
    id: "breathing-reset",
    name: "Parasympathetic Breathing Reset",
    focus: "Recovery",
    equipment: "None",
    primaryMuscles: ["Diaphragm"],
    description: "Guided breath sequence to down-regulate and accelerate recovery."
  }
];

const DEFAULT_STATE: PlannerState = {
  workouts: [
    {
      id: "alpha-strength",
      title: "Lower Body Power",
      focus: "Strength",
      intensity: "High",
      trainingEffect: "Explosive strength + posterior-chain activation",
      exercises: [
        { exerciseId: "front-squat", prescription: "5 x 3 @ 80% 1RM" },
        { exerciseId: "hang-clean", prescription: "6 x 2 @ 70% 1RM" },
        { exerciseId: "rdl", prescription: "4 x 6 controlled eccentric" }
      ],
      notes: "Emphasize bar speed and full recovery between sets."
    },
    {
      id: "engine-builder",
      title: "Engine Builder",
      focus: "Endurance",
      intensity: "Medium",
      trainingEffect: "Conditioning capacity + aerobic base",
      exercises: [
        { exerciseId: "assault-bike", prescription: "6 rounds :30 hard / :60 cruise" },
        { exerciseId: "tempo-pushup", prescription: "3 x 12 @ 3-1-1 tempo" },
        { exerciseId: "copenhagen-plank", prescription: "3 x :30/side" }
      ],
      notes: "Aim to recover breathing to conversational pace during cruise."
    },
    {
      id: "reset-flow",
      title: "Active Recovery Flow",
      focus: "Recovery",
      intensity: "Low",
      trainingEffect: "Mobility + parasympathetic reset",
      exercises: [
        { exerciseId: "90-90-hovers", prescription: "3 x 5 slow transitions" },
        { exerciseId: "breathing-reset", prescription: "5 minutes boxed breathing" },
        { exerciseId: "single-leg-row", prescription: "2 x 15 light" }
      ],
      notes: "Keep effort low; finish feeling fresher than you started."
    }
  ],
  schedule: {
    monday: [
      { id: "slot-mon-am", workoutId: "alpha-strength", timeOfDay: "Morning", notes: "Fast carbs pre-lift" }
    ],
    tuesday: [
      { id: "slot-tue-pm", workoutId: "engine-builder", timeOfDay: "Evening", notes: "Zone 3 cap" }
    ],
    wednesday: [],
    thursday: [
      { id: "slot-thu-am", workoutId: "alpha-strength", timeOfDay: "Morning", notes: "Reduce load 10%" }
    ],
    friday: [
      { id: "slot-fri-lunch", workoutId: "engine-builder", timeOfDay: "Midday" }
    ],
    saturday: [
      { id: "slot-sat-am", workoutId: "reset-flow", timeOfDay: "Morning", notes: "Outdoor session" }
    ],
    sunday: []
  }
};

const TIME_SLOTS: ScheduledWorkout["timeOfDay"][] = ["Morning", "Midday", "Evening"];

type BuilderState = {
  title: string;
  focus: FocusArea;
  intensity: IntensityLevel;
  trainingEffect: string;
  exercises: Record<string, string>;
  notes: string;
};

const EMPTY_BUILDER: BuilderState = {
  title: "",
  focus: "Strength",
  intensity: "Medium",
  trainingEffect: "",
  exercises: {},
  notes: ""
};

const safeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}`;
};

export default function Planner() {
  const [state, setState] = useState<PlannerState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayId>("monday");
  const [builder, setBuilder] = useState<BuilderState>(EMPTY_BUILDER);
  const [assignWorkoutId, setAssignWorkoutId] = useState<string>("");
  const [assignTime, setAssignTime] = useState<ScheduledWorkout["timeOfDay"]>("Morning");
  const [assignNotes, setAssignNotes] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlannerState;
        setState({
          workouts: parsed.workouts ?? DEFAULT_STATE.workouts,
          schedule: { ...DEFAULT_STATE.schedule, ...(parsed.schedule ?? {}) }
        });
      }
    } catch (error) {
      console.warn("Failed to load planner state", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    if (state.workouts.length) {
      setAssignWorkoutId((prev) => prev || state.workouts[0]?.id || "");
    }
  }, [state.workouts]);

  const selectedDaySchedule = state.schedule[selectedDay] ?? [];

  const summary = useMemo(() => {
    const totalSessions = Object.values(state.schedule).reduce(
      (acc, sessions) => acc + sessions.length,
      0
    );

    const intensityBuckets: Record<IntensityLevel, number> = {
      Low: 0,
      Medium: 0,
      High: 0
    };

    const focusBuckets: Partial<Record<FocusArea, number>> = {};

    for (const sessions of Object.values(state.schedule)) {
      for (const slot of sessions) {
        const workout = state.workouts.find((item) => item.id === slot.workoutId);
        if (!workout) continue;
        intensityBuckets[workout.intensity] += 1;
        focusBuckets[workout.focus] = (focusBuckets[workout.focus] ?? 0) + 1;
      }
    }

    const recoveryDays = DAYS.filter((day) => (state.schedule[day.id]?.length ?? 0) === 0).length;

    const dominantFocus =
      Object.entries(focusBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Balanced";

    return {
      totalSessions,
      intensityBuckets,
      dominantFocus,
      recoveryDays
    };
  }, [state]);

  const handleToggleExercise = (exerciseId: string) => {
    setBuilder((prev) => {
      const exercises = { ...prev.exercises };
      if (exerciseId in exercises) {
        delete exercises[exerciseId];
      } else {
        exercises[exerciseId] = "3 x 12";
      }
      return { ...prev, exercises };
    });
  };

  const handleUpdatePrescription = (exerciseId: string, value: string) => {
    setBuilder((prev) => ({
      ...prev,
      exercises: { ...prev.exercises, [exerciseId]: value }
    }));
  };

  const handleCreateWorkout = () => {
    if (!builder.title.trim() || Object.keys(builder.exercises).length === 0) {
      return;
    }

    const newWorkout: Workout = {
      id: safeId(),
      title: builder.title.trim(),
      focus: builder.focus,
      intensity: builder.intensity,
      trainingEffect: builder.trainingEffect || `${builder.focus} development`,
      exercises: Object.entries(builder.exercises).map(([exerciseId, prescription]) => ({
        exerciseId,
        prescription
      })),
      notes: builder.notes.trim() || undefined
    };

    setState((prev) => ({
      workouts: [...prev.workouts, newWorkout],
      schedule: { ...prev.schedule }
    }));
    setBuilder(EMPTY_BUILDER);
    setAssignWorkoutId(newWorkout.id);
  };

  const handleAssignWorkout = () => {
    if (!assignWorkoutId) {
      return;
    }

    setState((prev) => {
      const existing = prev.schedule[selectedDay] ?? [];
      const next: ScheduledWorkout = {
        id: safeId(),
        workoutId: assignWorkoutId,
        timeOfDay: assignTime,
        notes: assignNotes.trim() || undefined
      };
      return {
        workouts: prev.workouts,
        schedule: {
          ...prev.schedule,
          [selectedDay]: [...existing, next]
        }
      };
    });

    setAssignNotes("");
  };

  const handleRemoveSlot = (slotId: string) => {
    setState((prev) => ({
      workouts: prev.workouts,
      schedule: {
        ...prev.schedule,
        [selectedDay]: (prev.schedule[selectedDay] ?? []).filter((slot) => slot.id !== slotId)
      }
    }));
  };

  const hydrateGate = hydrated ? (
    <>
      <header className="card" style={{ marginBottom: "1.2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <div className="chip">PulsePlan Weekly</div>
            <h1 style={{ margin: "0.65rem 0 0", fontSize: "2.35rem", lineHeight: 1.1 }}>
              Personal Mobile Workout Planner
            </h1>
            <p style={{ marginTop: "0.75rem", maxWidth: "520px", color: "rgba(226,232,240,0.75)" }}>
              Map your sessions, balance intensities, and keep a rolling view of your training stress that
              syncs across the week.
            </p>
          </div>
          <div
            className="glass"
            style={{
              padding: "1rem 1.35rem",
              display: "grid",
              gap: "0.85rem",
              minWidth: "240px"
            }}
          >
            <div>
              <span className="section-title">This Week</span>
              <h2 style={{ margin: "0.4rem 0 0", fontSize: "1.8rem" }}>{summary.totalSessions} sessions</h2>
              <p className="text-muted" style={{ margin: "0.2rem 0 0" }}>
                {summary.dominantFocus} focus · {summary.recoveryDays} recovery days
              </p>
            </div>
            <div className="divider" />
            <div className="pill-group">
              <div className="pill intensity-high">High × {summary.intensityBuckets.High}</div>
              <div className="pill intensity-medium">Medium × {summary.intensityBuckets.Medium}</div>
              <div className="pill intensity-low">Low × {summary.intensityBuckets.Low}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="planner-layout">
        <section className="card" style={{ display: "grid", gap: "1.25rem" }}>
          <div className="section-header">
            <div>
              <p className="section-title">Weekly Flow</p>
              <h2 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Tap a day to adjust assignments</h2>
            </div>
            <div className="section-actions">
              <div className="tag">Recovery days {summary.recoveryDays}/7</div>
            </div>
          </div>

          <div className="day-list">
            {DAYS.map((day) => (
              <button
                key={day.id}
                type="button"
                className={`day-pill ${selectedDay === day.id ? "active" : ""}`}
                onClick={() => setSelectedDay(day.id)}
              >
                <h3>{day.label}</h3>
                <span>{day.affirmation}</span>
                <div className="pill-group" style={{ marginTop: "0.35rem" }}>
                  <div className="tag">
                    {(state.schedule[day.id]?.length ?? 0) > 0
                      ? `${state.schedule[day.id]?.length} session${(state.schedule[day.id]?.length ?? 0) > 1 ? "s" : ""}`
                      : "Recovery"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="glass" style={{ padding: "1rem 1.25rem", display: "grid", gap: "1rem" }}>
            <header style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <span className="section-title">{selectedDay.toUpperCase()}</span>
                <h3 style={{ margin: "0.3rem 0 0" }}>{DAYS.find((d) => d.id === selectedDay)?.affirmation}</h3>
              </div>
              <div className="tag">Schedule builder</div>
            </header>

            <div className="grid">
              {selectedDaySchedule.length === 0 && (
                <div
                  className="glass"
                  style={{
                    border: "1px dashed rgba(148,163,184,0.35)",
                    padding: "1.1rem",
                    textAlign: "center"
                  }}
                >
                  <p style={{ margin: 0, color: "rgba(226,232,240,0.75)" }}>
                    No workouts assigned. Add one below to set the tone.
                  </p>
                </div>
              )}

              {selectedDaySchedule.map((slot) => {
                const workout = state.workouts.find((w) => w.id === slot.workoutId);
                if (!workout) {
                  return null;
                }

                const exerciseDetails = workout.exercises
                  .map((item) => {
                    const exercise = EXERCISE_LIBRARY.find((ex) => ex.id === item.exerciseId);
                    return exercise ? `${exercise.name} · ${item.prescription}` : item.prescription;
                  })
                  .join("\n");

                return (
                  <div key={slot.id} className="workout-card">
                    <div className="workout-card-title">
                      <div>
                        <div className={`pill intensity-${workout.intensity.toLowerCase()}`}>
                          {slot.timeOfDay} · {workout.intensity} intensity
                        </div>
                        <h4>{workout.title}</h4>
                      </div>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                        onClick={() => handleRemoveSlot(slot.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-muted" style={{ margin: 0 }}>{workout.trainingEffect}</p>
                    <ul className="exercise-list">
                      {workout.exercises.map((item) => {
                        const exercise = EXERCISE_LIBRARY.find((ex) => ex.id === item.exerciseId);
                        return (
                          <li key={item.exerciseId}>
                            <strong>{exercise?.name ?? "Exercise"}</strong> — {item.prescription}
                          </li>
                        );
                      })}
                    </ul>
                    {slot.notes && (
                      <p className="text-muted" style={{ margin: 0 }}>
                        Notes: {slot.notes}
                      </p>
                    )}
                    <details style={{ color: "rgba(148,163,184,0.75)" }}>
                      <summary style={{ cursor: "pointer" }}>Exercise detail</summary>
                      <pre
                        style={{
                          margin: "0.6rem 0 0",
                          background: "rgba(15,23,42,0.45)",
                          padding: "0.75rem",
                          borderRadius: "10px",
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                          fontSize: "0.9rem"
                        }}
                      >
                        {exerciseDetails}
                      </pre>
                    </details>
                  </div>
                );
              })}
            </div>

            <div className="divider" />

            <div className="form-grid">
              <h4 style={{ margin: 0 }}>Add workout to {DAYS.find((d) => d.id === selectedDay)?.label}</h4>
              <label className="label">
                Workout
                <select
                  className="input"
                  value={assignWorkoutId}
                  onChange={(event) => setAssignWorkoutId(event.target.value)}
                >
                  {state.workouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                      {workout.title}
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <label className="label" style={{ flex: "1 1 160px" }}>
                  Time of day
                  <select
                    className="input"
                    value={assignTime}
                    onChange={(event) =>
                      setAssignTime(event.target.value as ScheduledWorkout["timeOfDay"])
                    }
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="label" style={{ flex: "1 1 200px" }}>
                  Quick note
                  <input
                    className="input"
                    placeholder="Optional"
                    value={assignNotes}
                    onChange={(event) => setAssignNotes(event.target.value)}
                  />
                </label>
              </div>
              <button type="button" className="btn" onClick={handleAssignWorkout}>
                Schedule this session
              </button>
            </div>
          </div>
        </section>

        <aside className="card" style={{ display: "grid", gap: "1.25rem" }}>
          <div>
            <p className="section-title">Create Workout</p>
            <h2 style={{ margin: "0.4rem 0 0", fontSize: "1.45rem" }}>Build a new session</h2>
          </div>

          <div className="form-grid">
            <label className="label">
              Title
              <input
                className="input"
                placeholder="e.g. Posterior Chain Reload"
                value={builder.title}
                onChange={(event) => setBuilder((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <label className="label" style={{ flex: "1 1 160px" }}>
                Focus area
                <select
                  className="input"
                  value={builder.focus}
                  onChange={(event) =>
                    setBuilder((prev) => ({
                      ...prev,
                      focus: event.target.value as FocusArea
                    }))
                  }
                >
                  <option value="Strength">Strength</option>
                  <option value="Hypertrophy">Hypertrophy</option>
                  <option value="Endurance">Endurance</option>
                  <option value="Mobility">Mobility</option>
                  <option value="Recovery">Recovery</option>
                </select>
              </label>
              <label className="label" style={{ flex: "1 1 160px" }}>
                Intensity
                <select
                  className="input"
                  value={builder.intensity}
                  onChange={(event) =>
                    setBuilder((prev) => ({
                      ...prev,
                      intensity: event.target.value as IntensityLevel
                    }))
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
            </div>
            <label className="label">
              Training effect
              <input
                className="input"
                placeholder="e.g. Posterior chain strength + hamstring control"
                value={builder.trainingEffect}
                onChange={(event) =>
                  setBuilder((prev) => ({ ...prev, trainingEffect: event.target.value }))
                }
              />
            </label>
            <label className="label">
              Session notes
              <textarea
                className="input"
                rows={3}
                placeholder="Optional: cues, pacing, breathing notes"
                value={builder.notes}
                onChange={(event) => setBuilder((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </label>
          </div>

          <div>
            <p className="section-title" style={{ marginBottom: "0.75rem" }}>
              Exercises
            </p>
            <div className="scroll-stack" style={{ maxHeight: "260px" }}>
              {EXERCISE_LIBRARY.map((exercise) => {
                const selected = exercise.id in builder.exercises;
                return (
                  <div key={exercise.id} className="exercise-option">
                    <div>
                      <strong>{exercise.name}</strong>
                      <p className="text-muted" style={{ margin: "0.3rem 0 0" }}>
                        {exercise.focus} · {exercise.primaryMuscles.join(", ")}
                      </p>
                    </div>
                    <div style={{ display: "grid", gap: "0.4rem", justifyItems: "end" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleToggleExercise(exercise.id)}
                        />
                        Include
                      </label>
                      {selected && (
                        <input
                          className="input"
                          style={{ width: "180px" }}
                          value={builder.exercises[exercise.id]}
                          onChange={(event) =>
                            handleUpdatePrescription(exercise.id, event.target.value)
                          }
                          placeholder="Prescription"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="btn"
            onClick={handleCreateWorkout}
            style={{ marginTop: "0.25rem" }}
          >
            Save workout
          </button>

          <div className="glass" style={{ padding: "1rem 1.25rem", display: "grid", gap: "0.8rem" }}>
            <div className="section-header" style={{ alignItems: "center" }}>
              <p className="section-title">Workout Library</p>
              <div className="tag">{state.workouts.length} total</div>
            </div>
            <div className="scroll-stack" style={{ maxHeight: "240px" }}>
              {state.workouts.map((workout) => (
                <div key={workout.id} className="glass" style={{ padding: "0.75rem 0.95rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{workout.title}</h4>
                      <p className="text-muted" style={{ margin: "0.3rem 0 0" }}>
                        {workout.trainingEffect}
                      </p>
                    </div>
                    <div className="pill-group" style={{ alignSelf: "flex-start" }}>
                      <div className={`pill intensity-${workout.intensity.toLowerCase()}`}>
                        {workout.intensity}
                      </div>
                      <div className="pill" style={{ background: "rgba(59,130,246,0.18)", borderColor: "rgba(59,130,246,0.35)", color: "#bfdbfe" }}>
                        {workout.focus}
                      </div>
                    </div>
                  </div>
                  <ul className="exercise-list" style={{ marginTop: "0.6rem" }}>
                    {workout.exercises.map((exercise) => {
                      const meta = EXERCISE_LIBRARY.find((item) => item.id === exercise.exerciseId);
                      return (
                        <li key={exercise.exerciseId}>
                          <strong>{meta?.name ?? "Exercise"}</strong> — {exercise.prescription}
                        </li>
                      );
                    })}
                  </ul>
                  {workout.notes && (
                    <p className="text-muted" style={{ margin: "0.4rem 0 0" }}>
                      Notes: {workout.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  ) : (
    <div className="card" style={{ textAlign: "center" }}>
      <p>Loading your planner…</p>
    </div>
  );

  return hydrateGate;
}
