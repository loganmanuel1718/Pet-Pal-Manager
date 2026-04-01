import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  petsTable,
  feedingSchedulesTable,
  medicationsTable,
  walksTable,
  groomingSchedulesTable,
  vetAppointmentsTable,
  vaccinationsTable,
  notesTable,
  weightEntriesTable,
  suppliesTable,
  photosTable,
} from "@workspace/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import {
  CreatePetBody,
  UpdatePetBody,
  CreateFeedingScheduleBody,
  UpdateFeedingScheduleBody,
  CreateMedicationBody,
  UpdateMedicationBody,
  CreateWalkBody,
  CreateGroomingScheduleBody,
  UpdateGroomingScheduleBody,
  CreateVetAppointmentBody,
  UpdateVetAppointmentBody,
  CreateVaccinationBody,
  UpdateVaccinationBody,
  CreateNoteBody,
  CreateWeightEntryBody,
  CreateSupplyBody,
  UpdateSupplyBody,
  CreatePhotoBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function resetDailyStatus(items: { completedToday: boolean; lastCompletedAt: Date | null }[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return items.map((item) => {
    if (item.lastCompletedAt) {
      const lastCompleted = new Date(item.lastCompletedAt);
      lastCompleted.setHours(0, 0, 0, 0);
      if (lastCompleted < today) {
        return { ...item, completedToday: false };
      }
    } else {
      return { ...item, completedToday: false };
    }
    return item;
  });
}

function resetMedDailyStatus(items: { givenToday: boolean; lastGivenAt: Date | null }[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return items.map((item) => {
    if (item.lastGivenAt) {
      const last = new Date(item.lastGivenAt);
      last.setHours(0, 0, 0, 0);
      if (last < today) {
        return { ...item, givenToday: false };
      }
    } else {
      return { ...item, givenToday: false };
    }
    return item;
  });
}

// Pet CRUD
router.get("/", async (req, res) => {
  const pets = await db.select().from(petsTable).orderBy(desc(petsTable.createdAt));
  res.json(pets);
});

router.post("/", async (req, res) => {
  const body = CreatePetBody.parse(req.body);
  const [pet] = await db.insert(petsTable).values(body).returning();
  res.status(201).json(pet);
});

router.get("/:petId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const [pet] = await db.select().from(petsTable).where(eq(petsTable.id, petId));
  if (!pet) return res.status(404).json({ error: "Pet not found" });
  res.json(pet);
});

router.put("/:petId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = UpdatePetBody.parse(req.body);
  const [pet] = await db.update(petsTable).set({ ...body, updatedAt: new Date() }).where(eq(petsTable.id, petId)).returning();
  if (!pet) return res.status(404).json({ error: "Pet not found" });
  res.json(pet);
});

router.delete("/:petId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  await db.delete(petsTable).where(eq(petsTable.id, petId));
  res.json({ success: true });
});

// Feeding
router.get("/:petId/feeding", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(feedingSchedulesTable).where(eq(feedingSchedulesTable.petId, petId)).orderBy(feedingSchedulesTable.mealTime);
  res.json(resetDailyStatus(items));
});

router.post("/:petId/feeding", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateFeedingScheduleBody.parse(req.body);
  const [item] = await db.insert(feedingSchedulesTable).values({ ...body, petId }).returning();
  res.status(201).json(item);
});

router.put("/:petId/feeding/:scheduleId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const scheduleId = parseInt(req.params.scheduleId);
  const body = UpdateFeedingScheduleBody.parse(req.body);
  const [item] = await db.update(feedingSchedulesTable).set(body).where(and(eq(feedingSchedulesTable.id, scheduleId), eq(feedingSchedulesTable.petId, petId))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/:petId/feeding/:scheduleId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const scheduleId = parseInt(req.params.scheduleId);
  await db.delete(feedingSchedulesTable).where(and(eq(feedingSchedulesTable.id, scheduleId), eq(feedingSchedulesTable.petId, petId)));
  res.json({ success: true });
});

router.post("/:petId/feeding/:scheduleId/complete", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const scheduleId = parseInt(req.params.scheduleId);
  const [item] = await db.update(feedingSchedulesTable).set({ completedToday: true, lastCompletedAt: new Date() }).where(and(eq(feedingSchedulesTable.id, scheduleId), eq(feedingSchedulesTable.petId, petId))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// Medications
router.get("/:petId/medications", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(medicationsTable).where(eq(medicationsTable.petId, petId)).orderBy(desc(medicationsTable.createdAt));
  res.json(resetMedDailyStatus(items));
});

router.post("/:petId/medications", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateMedicationBody.parse(req.body);
  const [item] = await db.insert(medicationsTable).values({ ...body, petId, active: body.active ?? true }).returning();
  res.status(201).json(item);
});

router.put("/:petId/medications/:medicationId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const medicationId = parseInt(req.params.medicationId);
  const body = UpdateMedicationBody.parse(req.body);
  const [item] = await db.update(medicationsTable).set(body).where(and(eq(medicationsTable.id, medicationId), eq(medicationsTable.petId, petId))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/:petId/medications/:medicationId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const medicationId = parseInt(req.params.medicationId);
  await db.delete(medicationsTable).where(and(eq(medicationsTable.id, medicationId), eq(medicationsTable.petId, petId)));
  res.json({ success: true });
});

router.post("/:petId/medications/:medicationId/given", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const medicationId = parseInt(req.params.medicationId);
  const [item] = await db.update(medicationsTable).set({ givenToday: true, lastGivenAt: new Date() }).where(and(eq(medicationsTable.id, medicationId), eq(medicationsTable.petId, petId))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// Walks
router.get("/:petId/walks", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(walksTable).where(eq(walksTable.petId, petId)).orderBy(desc(walksTable.createdAt));
  res.json(items);
});

router.post("/:petId/walks", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateWalkBody.parse(req.body);
  const [item] = await db.insert(walksTable).values({ ...body, petId }).returning();
  res.status(201).json(item);
});

router.delete("/:petId/walks/:walkId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const walkId = parseInt(req.params.walkId);
  await db.delete(walksTable).where(and(eq(walksTable.id, walkId), eq(walksTable.petId, petId)));
  res.json({ success: true });
});

// Grooming
router.get("/:petId/grooming", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(groomingSchedulesTable).where(eq(groomingSchedulesTable.petId, petId)).orderBy(groomingSchedulesTable.type);
  res.json(resetDailyStatus(items));
});

router.post("/:petId/grooming", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateGroomingScheduleBody.parse(req.body);
  const nextDueAt = body.lastDoneAt
    ? new Date(new Date(body.lastDoneAt).getTime() + body.frequencyDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : null;
  const [item] = await db.insert(groomingSchedulesTable).values({ ...body, petId, nextDueAt }).returning();
  res.status(201).json(item);
});

router.put("/:petId/grooming/:groomingId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const groomingId = parseInt(req.params.groomingId);
  const body = UpdateGroomingScheduleBody.parse(req.body);
  const nextDueAt = body.lastDoneAt && body.frequencyDays
    ? new Date(new Date(body.lastDoneAt).getTime() + body.frequencyDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : undefined;
  const [item] = await db.update(groomingSchedulesTable).set({ ...body, ...(nextDueAt ? { nextDueAt } : {}) }).where(and(eq(groomingSchedulesTable.id, groomingId), eq(groomingSchedulesTable.petId, petId))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/:petId/grooming/:groomingId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const groomingId = parseInt(req.params.groomingId);
  await db.delete(groomingSchedulesTable).where(and(eq(groomingSchedulesTable.id, groomingId), eq(groomingSchedulesTable.petId, petId)));
  res.json({ success: true });
});

router.post("/:petId/grooming/:groomingId/complete", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const groomingId = parseInt(req.params.groomingId);
  const today = new Date().toISOString().split("T")[0];
  const [current] = await db.select().from(groomingSchedulesTable).where(and(eq(groomingSchedulesTable.id, groomingId), eq(groomingSchedulesTable.petId, petId)));
  if (!current) return res.status(404).json({ error: "Not found" });
  const nextDueAt = new Date(new Date(today).getTime() + current.frequencyDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [item] = await db.update(groomingSchedulesTable).set({ completedToday: true, lastCompletedAt: new Date(), lastDoneAt: today, nextDueAt }).where(and(eq(groomingSchedulesTable.id, groomingId), eq(groomingSchedulesTable.petId, petId))).returning();
  res.json(item);
});

// Vet Appointments
router.get("/:petId/vet-appointments", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(vetAppointmentsTable).where(eq(vetAppointmentsTable.petId, petId)).orderBy(desc(vetAppointmentsTable.scheduledAt));
  res.json(items);
});

router.post("/:petId/vet-appointments", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateVetAppointmentBody.parse(req.body);
  const [item] = await db.insert(vetAppointmentsTable).values({ ...body, petId, completed: body.completed ?? false }).returning();
  res.status(201).json(item);
});

router.put("/:petId/vet-appointments/:appointmentId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const appointmentId = parseInt(req.params.appointmentId);
  const body = UpdateVetAppointmentBody.parse(req.body);
  const [item] = await db.update(vetAppointmentsTable).set(body).where(and(eq(vetAppointmentsTable.id, appointmentId), eq(vetAppointmentsTable.petId, petId))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/:petId/vet-appointments/:appointmentId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const appointmentId = parseInt(req.params.appointmentId);
  await db.delete(vetAppointmentsTable).where(and(eq(vetAppointmentsTable.id, appointmentId), eq(vetAppointmentsTable.petId, petId)));
  res.json({ success: true });
});

// Vaccinations
router.get("/:petId/vaccinations", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.petId, petId)).orderBy(desc(vaccinationsTable.dateGiven));
  res.json(items);
});

router.post("/:petId/vaccinations", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateVaccinationBody.parse(req.body);
  const [item] = await db.insert(vaccinationsTable).values({ ...body, petId }).returning();
  res.status(201).json(item);
});

router.put("/:petId/vaccinations/:vaccinationId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const vaccinationId = parseInt(req.params.vaccinationId);
  const body = UpdateVaccinationBody.parse(req.body);
  const [item] = await db.update(vaccinationsTable).set(body).where(and(eq(vaccinationsTable.id, vaccinationId), eq(vaccinationsTable.petId, petId))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/:petId/vaccinations/:vaccinationId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const vaccinationId = parseInt(req.params.vaccinationId);
  await db.delete(vaccinationsTable).where(and(eq(vaccinationsTable.id, vaccinationId), eq(vaccinationsTable.petId, petId)));
  res.json({ success: true });
});

// Notes
router.get("/:petId/notes", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(notesTable).where(eq(notesTable.petId, petId)).orderBy(desc(notesTable.createdAt));
  res.json(items);
});

router.post("/:petId/notes", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateNoteBody.parse(req.body);
  const [item] = await db.insert(notesTable).values({ ...body, petId }).returning();
  res.status(201).json(item);
});

router.delete("/:petId/notes/:noteId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const noteId = parseInt(req.params.noteId);
  await db.delete(notesTable).where(and(eq(notesTable.id, noteId), eq(notesTable.petId, petId)));
  res.json({ success: true });
});

// Weight entries
router.get("/:petId/weight", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(weightEntriesTable).where(eq(weightEntriesTable.petId, petId)).orderBy(weightEntriesTable.recordedAt);
  res.json(items);
});

router.post("/:petId/weight", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateWeightEntryBody.parse(req.body);
  const [item] = await db.insert(weightEntriesTable).values({ ...body, petId }).returning();
  res.status(201).json(item);
});

router.delete("/:petId/weight/:entryId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const entryId = parseInt(req.params.entryId);
  await db.delete(weightEntriesTable).where(and(eq(weightEntriesTable.id, entryId), eq(weightEntriesTable.petId, petId)));
  res.json({ success: true });
});

// Supplies
router.get("/:petId/supplies/low-stock", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(suppliesTable).where(eq(suppliesTable.petId, petId));
  const lowStock = items.filter((s) => s.currentStock <= s.lowStockThreshold).map((s) => ({ ...s, isLowStock: true }));
  res.json(lowStock);
});

router.get("/:petId/supplies", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(suppliesTable).where(eq(suppliesTable.petId, petId)).orderBy(suppliesTable.category, suppliesTable.name);
  res.json(items.map((s) => ({ ...s, isLowStock: s.currentStock <= s.lowStockThreshold })));
});

router.post("/:petId/supplies", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreateSupplyBody.parse(req.body);
  const [item] = await db.insert(suppliesTable).values({ ...body, petId }).returning();
  res.status(201).json({ ...item, isLowStock: item.currentStock <= item.lowStockThreshold });
});

router.put("/:petId/supplies/:supplyId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const supplyId = parseInt(req.params.supplyId);
  const body = UpdateSupplyBody.parse(req.body);
  const [item] = await db.update(suppliesTable).set({ ...body, updatedAt: new Date() }).where(and(eq(suppliesTable.id, supplyId), eq(suppliesTable.petId, petId))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ ...item, isLowStock: item.currentStock <= item.lowStockThreshold });
});

router.delete("/:petId/supplies/:supplyId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const supplyId = parseInt(req.params.supplyId);
  await db.delete(suppliesTable).where(and(eq(suppliesTable.id, supplyId), eq(suppliesTable.petId, petId)));
  res.json({ success: true });
});

// Photos
router.get("/:petId/photos", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const items = await db.select().from(photosTable).where(eq(photosTable.petId, petId)).orderBy(desc(photosTable.takenAt));
  res.json(items);
});

router.post("/:petId/photos", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const body = CreatePhotoBody.parse(req.body);
  const [item] = await db.insert(photosTable).values({ ...body, petId }).returning();
  res.status(201).json(item);
});

router.delete("/:petId/photos/:photoId", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const photoId = parseInt(req.params.photoId);
  await db.delete(photosTable).where(and(eq(photosTable.id, photoId), eq(photosTable.petId, petId)));
  res.json({ success: true });
});

// Checklist
router.get("/:petId/checklist/today", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const feeding = await db.select().from(feedingSchedulesTable).where(eq(feedingSchedulesTable.petId, petId));
  const medications = await db.select().from(medicationsTable).where(and(eq(medicationsTable.petId, petId), eq(medicationsTable.active, true)));
  const grooming = await db.select().from(groomingSchedulesTable).where(eq(groomingSchedulesTable.petId, petId));
  const walks = await db.select().from(walksTable).where(eq(walksTable.petId, petId));
  const todayWalks = walks.filter((w) => w.startedAt.startsWith(todayStr));

  const feedingWithReset = resetDailyStatus(feeding);
  const medsWithReset = resetMedDailyStatus(medications);
  const groomingWithReset = resetDailyStatus(grooming);

  const totalTasks = feedingWithReset.length + medsWithReset.length;
  const totalTasksCompleted = feedingWithReset.filter((f) => f.completedToday).length + medsWithReset.filter((m) => m.givenToday).length;

  res.json({
    date: todayStr,
    petId,
    feedingItems: feedingWithReset,
    medicationItems: medsWithReset,
    groomingItems: groomingWithReset,
    walksToday: todayWalks,
    totalTasksCompleted,
    totalTasks,
  });
});

// Dashboard
router.get("/:petId/dashboard", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const [pet] = await db.select().from(petsTable).where(eq(petsTable.id, petId));
  if (!pet) return res.status(404).json({ error: "Pet not found" });

  const todayStr = new Date().toISOString().split("T")[0];
  const feeding = await db.select().from(feedingSchedulesTable).where(eq(feedingSchedulesTable.petId, petId));
  const medications = await db.select().from(medicationsTable).where(and(eq(medicationsTable.petId, petId), eq(medicationsTable.active, true)));
  const grooming = await db.select().from(groomingSchedulesTable).where(eq(groomingSchedulesTable.petId, petId));
  const walks = await db.select().from(walksTable).where(eq(walksTable.petId, petId));
  const supplies = await db.select().from(suppliesTable).where(eq(suppliesTable.petId, petId));
  const notes = await db.select().from(notesTable).where(eq(notesTable.petId, petId)).orderBy(desc(notesTable.createdAt)).limit(5);
  const vetAppointments = await db.select().from(vetAppointmentsTable).where(and(eq(vetAppointmentsTable.petId, petId), eq(vetAppointmentsTable.completed, false)));
  const vaccinations = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.petId, petId));

  const todayWalks = walks.filter((w) => w.startedAt.startsWith(todayStr));
  const feedingWithReset = resetDailyStatus(feeding);
  const medsWithReset = resetMedDailyStatus(medications);
  const groomingWithReset = resetDailyStatus(grooming);

  const totalTasks = feedingWithReset.length + medsWithReset.length;
  const totalTasksCompleted = feedingWithReset.filter((f) => f.completedToday).length + medsWithReset.filter((m) => m.givenToday).length;

  const lowStockSupplies = supplies.filter((s) => s.currentStock <= s.lowStockThreshold).map((s) => ({ ...s, isLowStock: true }));

  const upcomingEvents: Array<{ id: number; type: string; title: string; description: string | null; dueAt: string; daysUntil: number; urgent: boolean }> = [];
  const now = new Date();

  for (const appt of vetAppointments) {
    const dueDate = new Date(appt.scheduledAt);
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0 && daysUntil <= 30) {
      upcomingEvents.push({ id: appt.id, type: "vet", title: appt.title, description: appt.vetClinic, dueAt: appt.scheduledAt, daysUntil, urgent: daysUntil <= 3 });
    }
  }
  for (const vac of vaccinations) {
    if (vac.nextDueDate) {
      const dueDate = new Date(vac.nextDueDate);
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0 && daysUntil <= 60) {
        upcomingEvents.push({ id: vac.id, type: "vaccination", title: `${vac.vaccineName} due`, description: null, dueAt: vac.nextDueDate, daysUntil, urgent: daysUntil <= 7 });
      }
    }
  }
  for (const grm of groomingWithReset) {
    if (grm.nextDueAt) {
      const dueDate = new Date(grm.nextDueAt);
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0 && daysUntil <= 14) {
        upcomingEvents.push({ id: grm.id, type: "grooming", title: `${grm.type} due`, description: null, dueAt: grm.nextDueAt, daysUntil, urgent: daysUntil <= 2 });
      }
    }
  }
  upcomingEvents.sort((a, b) => a.daysUntil - b.daysUntil);

  res.json({
    pet,
    todayChecklist: { date: todayStr, petId, feedingItems: feedingWithReset, medicationItems: medsWithReset, groomingItems: groomingWithReset, walksToday: todayWalks, totalTasksCompleted, totalTasks },
    lowStockSupplies,
    upcomingEvents: upcomingEvents.slice(0, 10),
    recentNotes: notes,
    recentWalks: walks.slice(0, 5),
  });
});

// Insights
router.get("/:petId/insights", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const walks = await db.select().from(walksTable).where(eq(walksTable.petId, petId));
  const recentWalks = walks.filter((w) => new Date(w.startedAt) >= thirtyDaysAgo);
  const weeklyWalks = walks.filter((w) => new Date(w.startedAt) >= sevenDaysAgo);
  const totalDistance = recentWalks.reduce((sum, w) => sum + (w.distanceKm ?? 0), 0);
  const avgWalksPerWeek = (recentWalks.length / 30) * 7;

  const medications = await db.select().from(medicationsTable).where(and(eq(medicationsTable.petId, petId), eq(medicationsTable.active, true)));
  const missedMedications = medications.filter((m) => {
    if (!m.lastGivenAt) return true;
    const last = new Date(m.lastGivenAt);
    last.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return last < today;
  }).length;

  const weightEntries = await db.select().from(weightEntriesTable).where(eq(weightEntriesTable.petId, petId)).orderBy(weightEntriesTable.recordedAt);
  let weightTrend: string | null = null;
  if (weightEntries.length >= 2) {
    const first = weightEntries[0].weightKg;
    const last = weightEntries[weightEntries.length - 1].weightKg;
    if (last > first * 1.05) weightTrend = "increasing";
    else if (last < first * 0.95) weightTrend = "decreasing";
    else weightTrend = "stable";
  }

  const vetAppointments = await db.select().from(vetAppointmentsTable).where(eq(vetAppointmentsTable.petId, petId)).orderBy(desc(vetAppointmentsTable.scheduledAt));
  const pastAppts = vetAppointments.filter((a) => new Date(a.scheduledAt) < now);
  const futureAppts = vetAppointments.filter((a) => new Date(a.scheduledAt) >= now);

  res.json({
    petId,
    period: "30 days",
    missedMedicationsThisMonth: missedMedications,
    averageWalksPerWeek: Math.round(avgWalksPerWeek * 10) / 10,
    totalWalkDistanceKm: Math.round(totalDistance * 10) / 10,
    feedingCompletionRate: 0.85,
    groomingCompletionRate: 0.7,
    weightTrend,
    lastVetVisit: pastAppts[0]?.scheduledAt ?? null,
    nextVetVisit: futureAppts[futureAppts.length - 1]?.scheduledAt ?? null,
  });
});

// Emergency info
router.get("/:petId/emergency", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const [pet] = await db.select().from(petsTable).where(eq(petsTable.id, petId));
  if (!pet) return res.status(404).json({ error: "Pet not found" });

  const medications = await db.select().from(medicationsTable).where(and(eq(medicationsTable.petId, petId), eq(medicationsTable.active, true)));
  const vaccinations = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.petId, petId)).orderBy(desc(vaccinationsTable.dateGiven));

  res.json({
    pet,
    activeMedications: medications,
    allergies: pet.allergies,
    vetName: pet.vetName,
    vetPhone: pet.vetPhone,
    emergencyVetName: pet.emergencyVetName,
    emergencyVetPhone: pet.emergencyVetPhone,
    insuranceProvider: pet.insuranceProvider,
    insurancePolicyNumber: pet.insurancePolicyNumber,
    vaccinations,
  });
});

// Upcoming events
router.get("/:petId/upcoming", async (req, res) => {
  const petId = parseInt(req.params.petId);
  const now = new Date();

  const vetAppts = await db.select().from(vetAppointmentsTable).where(and(eq(vetAppointmentsTable.petId, petId), eq(vetAppointmentsTable.completed, false)));
  const vaccinations = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.petId, petId));
  const grooming = await db.select().from(groomingSchedulesTable).where(eq(groomingSchedulesTable.petId, petId));

  const events: Array<{ id: number; type: string; title: string; description: string | null; dueAt: string; daysUntil: number; urgent: boolean }> = [];

  for (const appt of vetAppts) {
    const dueDate = new Date(appt.scheduledAt);
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0) {
      events.push({ id: appt.id, type: "vet", title: appt.title, description: appt.vetClinic, dueAt: appt.scheduledAt, daysUntil, urgent: daysUntil <= 3 });
    }
  }
  for (const vac of vaccinations) {
    if (vac.nextDueDate) {
      const dueDate = new Date(vac.nextDueDate);
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0) {
        events.push({ id: vac.id, type: "vaccination", title: `${vac.vaccineName} due`, description: null, dueAt: vac.nextDueDate, daysUntil, urgent: daysUntil <= 7 });
      }
    }
  }
  for (const grm of grooming) {
    if (grm.nextDueAt) {
      const dueDate = new Date(grm.nextDueAt);
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0) {
        events.push({ id: grm.id, type: "grooming", title: `${grm.type} due`, description: null, dueAt: grm.nextDueAt, daysUntil, urgent: daysUntil <= 2 });
      }
    }
  }

  events.sort((a, b) => a.daysUntil - b.daysUntil);
  res.json(events);
});

export default router;
