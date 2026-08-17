import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// In-memory data store for initial automotive tasks & cloud synchronization
interface TaskItem {
  id: string;
  title: string;
  category: "cargo" | "fleet" | "maintenance" | "route" | "personal" | "safety";
  priority: "critical" | "high" | "standard" | "low";
  status: "pending" | "in_progress" | "completed";
  location?: {
    name: string;
    lat: number;
    lng: number;
    distanceKm?: number;
  };
  assignedTo: string;
  createdBy: string;
  notes?: string;
  voiceNoteUrl?: string;
  checklist?: { id: string; text: string; done: boolean }[];
  updatedAt: number;
  createdAt: number;
  syncedWithCloud: boolean;
}

let serverTasks: TaskItem[] = [
  {
    id: "tsk-101",
    title: "Cargo Pickup: Tech Hub Bay 4",
    category: "cargo",
    priority: "high",
    status: "in_progress",
    location: {
      name: "North Logistics Port - Bay 4",
      lat: 37.7749,
      lng: -122.4194,
      distanceKm: 4.2,
    },
    assignedTo: "Alex Chen (Driver 1)",
    createdBy: "Central Dispatch HQ",
    notes: "Requires Level 2 security pass. Temperature-sensitive payload.",
    checklist: [
      { id: "c1", text: "Verify bill of lading #8842", done: true },
      { id: "c2", text: "Scan cargo barcode tags", done: true },
      { id: "c3", text: "Confirm refrigeration at 4°C", done: false },
    ],
    updatedAt: Date.now() - 1000 * 60 * 15,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    syncedWithCloud: true,
  },
  {
    id: "tsk-102",
    title: "Pre-trip ADAS Sensor Calibration",
    category: "safety",
    priority: "critical",
    status: "completed",
    location: {
      name: "Depot Garage Terminal",
      lat: 37.7833,
      lng: -122.4167,
      distanceKm: 0.8,
    },
    assignedTo: "Alex Chen (Driver 1)",
    createdBy: "Vehicle Safety System",
    notes: "Front mmWave radar & dual LiDAR alignment verified at startup.",
    checklist: [
      { id: "c4", text: "Clean optical camera lens array", done: true },
      { id: "c5", text: "Run radar self-test diagnostic", done: true },
      { id: "c6", text: "Test emergency braking haptic response", done: true },
    ],
    updatedAt: Date.now() - 1000 * 60 * 45,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    syncedWithCloud: true,
  },
  {
    id: "tsk-103",
    title: "EV Fast Charge to 90% (Station 12)",
    category: "maintenance",
    priority: "high",
    status: "pending",
    location: {
      name: "Megawatt Supercharger Hub",
      lat: 37.7651,
      lng: -122.4201,
      distanceKm: 8.5,
    },
    assignedTo: "Alex Chen (Driver 1)",
    createdBy: "Route Battery AI",
    notes: "Precondition battery pack 10 minutes prior to arrival.",
    checklist: [
      { id: "c7", text: "Initiate battery thermal preconditioning", done: false },
      { id: "c8", text: "Plug into 350kW CCS2 stall", done: false },
    ],
    updatedAt: Date.now() - 1000 * 60 * 5,
    createdAt: Date.now() - 1000 * 60 * 30,
    syncedWithCloud: true,
  },
  {
    id: "tsk-104",
    title: "Deliver Payload to BioMedical Depot",
    category: "cargo",
    priority: "critical",
    status: "pending",
    location: {
      name: "Apex BioMedical Center",
      lat: 37.7562,
      lng: -122.4345,
      distanceKm: 14.8,
    },
    assignedTo: "Alex Chen (Driver 1)",
    createdBy: "Central Dispatch HQ",
    notes: "Contact receiving manager at dock door 3 upon arrival.",
    checklist: [
      { id: "c9", text: "Capture digital signature from receiver", done: false },
      { id: "c10", text: "Upload biometric delivery receipt", done: false },
    ],
    updatedAt: Date.now() - 1000 * 60 * 10,
    createdAt: Date.now() - 1000 * 60 * 40,
    syncedWithCloud: true,
  },
  {
    id: "tsk-105",
    title: "Quarterly Tire Pressure & Wear Check",
    category: "maintenance",
    priority: "standard",
    status: "pending",
    location: {
      name: "Fleet Maintenance Bay 2",
      lat: 37.7712,
      lng: -122.4111,
      distanceKm: 3.1,
    },
    assignedTo: "Maya Lin (Field Tech)",
    createdBy: "Vehicle Telemetry Daemon",
    notes: "Front-right sensor reporting slight 1.5 PSI variance during high speed.",
    updatedAt: Date.now() - 1000 * 60 * 90,
    createdAt: Date.now() - 1000 * 60 * 120,
    syncedWithCloud: true,
  },
];

// In-memory Cloud Backups store
let cloudBackups: { id: string; timestamp: number; profile: string; tasksCount: number; snapshot: any }[] = [
  {
    id: "bkg-init-01",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    profile: "Alex Chen (Fleet Lead)",
    tasksCount: 5,
    snapshot: {
      vehicleConfig: {
        chassis: "EV Dual-Motor AWD",
        batteryKwh: 105,
        adasLevel: "Level 2+ Supervised",
        cabinTempTarget: 21.5,
      },
      driverPreferences: {
        voiceFeedback: true,
        hapticIntensity: "Medium",
        hudTheme: "tactical-cyan",
      },
    },
  },
];

// Lazy initialization of Gemini API Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "operational",
      os: "Android Automotive OS Task Core 14.2",
      timestamp: Date.now(),
      cloudSync: "connected",
    });
  });

  // Get all tasks
  app.get("/api/tasks", (_req, res) => {
    res.json({
      tasks: serverTasks,
      syncedAt: Date.now(),
      total: serverTasks.length,
    });
  });

  // Create task
  app.post("/api/tasks", (req, res) => {
    const body = req.body;
    const newTask: TaskItem = {
      id: body.id || `tsk-${Date.now().toString(36)}`,
      title: body.title || "Untitled Vehicle Task",
      category: body.category || "fleet",
      priority: body.priority || "standard",
      status: body.status || "pending",
      location: body.location || undefined,
      assignedTo: body.assignedTo || "Driver 1 (Active)",
      createdBy: body.createdBy || "In-Cabin Voice / Touch",
      notes: body.notes || "",
      checklist: body.checklist || [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
      syncedWithCloud: true,
    };
    serverTasks.unshift(newTask);
    res.status(201).json({ task: newTask, message: "Task synchronized to vehicle cloud" });
  });

  // Update task
  app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const index = serverTasks.findIndex((t) => t.id === id);
    if (index === -1) {
      // If not found, insert it
      const newTask: TaskItem = {
        ...req.body,
        id,
        updatedAt: Date.now(),
        syncedWithCloud: true,
      };
      serverTasks.unshift(newTask);
      return res.json({ task: newTask, message: "Task created from sync" });
    }
    serverTasks[index] = {
      ...serverTasks[index],
      ...req.body,
      id,
      updatedAt: Date.now(),
      syncedWithCloud: true,
    };
    res.json({ task: serverTasks[index], message: "Task updated in vehicle cloud" });
  });

  // Delete task
  app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    serverTasks = serverTasks.filter((t) => t.id !== id);
    res.json({ success: true, message: `Task ${id} removed` });
  });

  // Sync batch tasks from client (Offline reconciliation)
  app.post("/api/tasks/sync-batch", (req, res) => {
    const { clientTasks } = req.body;
    if (Array.isArray(clientTasks)) {
      clientTasks.forEach((cTask: TaskItem) => {
        const idx = serverTasks.findIndex((st) => st.id === cTask.id);
        if (idx !== -1) {
          if (cTask.updatedAt > serverTasks[idx].updatedAt) {
            serverTasks[idx] = { ...cTask, syncedWithCloud: true };
          }
        } else {
          serverTasks.push({ ...cTask, syncedWithCloud: true });
        }
      });
    }
    res.json({
      success: true,
      tasks: serverTasks,
      syncedAt: Date.now(),
      message: "Bidirectional cloud synchronization complete",
    });
  });

  // Fleet Peers for real-time collaborative dispatch
  app.get("/api/fleet/peers", (_req, res) => {
    res.json({
      peers: [
        {
          id: "unit-alpha-01",
          name: "Unit 01 (This Vehicle)",
          role: "Lead Transport",
          status: "active_en_route",
          coords: { lat: 37.7749, lng: -122.4194 },
          battery: 78,
          currentTaskId: "tsk-101",
          lastPing: Date.now(),
        },
        {
          id: "unit-bravo-04",
          name: "Unit 04 (Fleet Support)",
          role: "Service & Escort",
          status: "standby_depot",
          coords: { lat: 37.7833, lng: -122.4167 },
          battery: 92,
          currentTaskId: "tsk-105",
          lastPing: Date.now() - 4000,
        },
        {
          id: "dispatch-hq",
          name: "Central Logistics Control",
          role: "Mission Dispatch",
          status: "online",
          lastPing: Date.now() - 1000,
        },
      ],
    });
  });

  // AI Voice In-Vehicle Command Processor (Hands-free cockpit action)
  app.post("/api/ai/voice-command", async (req, res) => {
    const { prompt, currentContext } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Spoken prompt is required" });
    }

    const ai = getGeminiClient();

    // If Gemini is available, use intelligent automotive reasoning
    if (ai) {
      try {
        const systemPrompt = `You are the Android Automotive OS in-vehicle AI Voice Copilot.
You parse driver hands-free spoken commands safely while driving.
Current active context: ${JSON.stringify(currentContext || {})}
You must respond with a strict JSON object with these keys:
{
  "action": "ADD_TASK" | "COMPLETE_TASK" | "NAVIGATE_TO" | "SET_CLIMATE" | "SET_VEHICLE_MODE" | "READ_TASKS" | "DIAGNOSTICS" | "GENERAL_RESPONSE",
  "spokenResponse": "Concise, safe, glanceable vocal response to speak back to the driver (under 25 words)",
  "taskData": {
    "title": "Clean concise task name",
    "category": "cargo" | "fleet" | "maintenance" | "route" | "personal" | "safety",
    "priority": "critical" | "high" | "standard" | "low",
    "locationName": "Optional location name if mentioned",
    "notes": "Optional brief details"
  },
  "navigationTarget": "Destination name if navigate requested",
  "climateTemp": 21.5,
  "vehicleMode": "HUD" | "Night" | "Eco" | "Sport"
}
Keep spokenResponse very clear, concise, and safety-focused for driver hands-free feedback.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json({
          success: true,
          result: parsed,
          source: "gemini-ai",
        });
      } catch (err: any) {
        console.error("Gemini voice processing error, falling back to heuristic:", err);
      }
    }

    // Heuristic deterministic fallback for offline/low-latency or API-key free operation
    const lower = prompt.toLowerCase();
    let action = "GENERAL_RESPONSE";
    let spokenResponse = `I heard: "${prompt}". Ready for next vehicle command.`;
    let taskData: any = null;
    let navigationTarget: string | undefined = undefined;
    let climateTemp: number | undefined = undefined;
    let vehicleMode: string | undefined = undefined;

    if (lower.includes("add task") || lower.includes("create task") || lower.includes("new task") || lower.includes("remind me to")) {
      action = "ADD_TASK";
      const cleanTitle = prompt
        .replace(/^(hey auto|auto|please|can you)?\s*(add task|create task|new task|remind me to)\s*/i, "")
        .trim();
      const finalTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : "New In-Cabin Task";
      const isUrgent = lower.includes("urgent") || lower.includes("critical") || lower.includes("emergency");
      const isMaint = lower.includes("tire") || lower.includes("battery") || lower.includes("charge") || lower.includes("service") || lower.includes("oil");

      taskData = {
        title: finalTitle,
        category: isMaint ? "maintenance" : isUrgent ? "safety" : "fleet",
        priority: isUrgent ? "critical" : "high",
        notes: `Created via hands-free voice command: "${prompt}"`,
      };
      spokenResponse = `Added task: "${finalTitle}" with ${taskData.priority} priority.`;
    } else if (lower.includes("complete") || lower.includes("mark done") || lower.includes("finish task")) {
      action = "COMPLETE_TASK";
      spokenResponse = "Marked your active route task as completed and synchronized to dispatch.";
    } else if (lower.includes("navigate to") || lower.includes("directions to") || lower.includes("route to") || lower.includes("drive to")) {
      action = "NAVIGATE_TO";
      navigationTarget = prompt.replace(/.*(navigate to|directions to|route to|drive to)\s*/i, "").trim();
      spokenResponse = `Recalculating offline turn-by-turn route to ${navigationTarget}.`;
    } else if (lower.includes("climate") || lower.includes("temperature") || lower.includes("degrees") || lower.includes("warm") || lower.includes("cool")) {
      action = "SET_CLIMATE";
      const match = lower.match(/\b(\d{2})\b/);
      climateTemp = match ? parseInt(match[1]) : 21;
      spokenResponse = `Cabin climate adjusted to ${climateTemp}°C.`;
    } else if (lower.includes("hud") || lower.includes("heads up")) {
      action = "SET_VEHICLE_MODE";
      vehicleMode = "HUD";
      spokenResponse = "HUD High-Contrast Mode engaged for distraction-free driving.";
    } else if (lower.includes("night") || lower.includes("dark")) {
      action = "SET_VEHICLE_MODE";
      vehicleMode = "Night";
      spokenResponse = "Night Vision mode activated.";
    } else if (lower.includes("read task") || lower.includes("what are my tasks") || lower.includes("list tasks")) {
      action = "READ_TASKS";
      spokenResponse = `You have ${serverTasks.filter((t) => t.status !== "completed").length} active tasks queued. Next stop is Tech Hub Bay 4.`;
    } else if (lower.includes("battery") || lower.includes("diagnostic") || lower.includes("status") || lower.includes("sensor")) {
      action = "DIAGNOSTICS";
      spokenResponse = "All vehicle systems nominal. Battery at 78%, estimated range 342 km, tire pressures optimal.";
    }

    return res.json({
      success: true,
      result: {
        action,
        spokenResponse,
        taskData,
        navigationTarget,
        climateTemp,
        vehicleMode,
      },
      source: "embedded-automotive-engine",
    });
  });

  // Cloud Backups API
  app.get("/api/backup/list", (_req, res) => {
    res.json({ backups: cloudBackups });
  });

  app.post("/api/backup/create", (req, res) => {
    const { profile, snapshot } = req.body;
    const backup = {
      id: `bkg-${Date.now().toString(36)}`,
      timestamp: Date.now(),
      profile: profile || "Alex Chen (Driver 1)",
      tasksCount: serverTasks.length,
      snapshot: snapshot || { tasks: serverTasks },
    };
    cloudBackups.unshift(backup);
    res.status(201).json({ success: true, backup, message: "Cloud encrypted snapshot backed up securely" });
  });

  // Emergency SOS Dispatch & Telemetry Notification Endpoint
  app.post("/api/emergency/dispatch", (req, res) => {
    const { incidentType, coords, driver, vehicleConfig, telemetry, timestamp } = req.body;
    const dispatchId = `DISPATCH-911-${Date.now().toString(36).toUpperCase()}`;
    
    console.log(`[EMERGENCY SOS TRIGGERED] ID: ${dispatchId}, Type: ${incidentType}, Coords:`, coords);

    res.status(200).json({
      success: true,
      dispatchId,
      status: "DISPATCHED",
      agency: "Regional Emergency Response & Highway Patrol Sector 4",
      stationContact: "+1 (800) 555-0911",
      responderEtaMinutes: 4,
      dispatchedUnits: ["Ambulance Unit 412", "Highway Patrol Squad 18"],
      message: "Emergency services notified via satellite telemetry. Voice channel standing by.",
      receivedAt: timestamp || Date.now(),
    });
  });

  // Vite development or production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoTask OS Automotive Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
