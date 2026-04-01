import { pgTable, serial, text, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const petsTable = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  age: real("age"),
  weight: real("weight"),
  sex: text("sex"),
  birthday: text("birthday"),
  photoUrl: text("photo_url"),
  medicalNotes: text("medical_notes"),
  allergies: text("allergies"),
  vetName: text("vet_name"),
  vetPhone: text("vet_phone"),
  vetAddress: text("vet_address"),
  emergencyVetName: text("emergency_vet_name"),
  emergencyVetPhone: text("emergency_vet_phone"),
  insuranceProvider: text("insurance_provider"),
  insurancePolicyNumber: text("insurance_policy_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPetSchema = createInsertSchema(petsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof petsTable.$inferSelect;

export const feedingSchedulesTable = pgTable("feeding_schedules", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  mealName: text("meal_name").notNull(),
  mealTime: text("meal_time").notNull(),
  foodType: text("food_type"),
  portionSize: text("portion_size"),
  instructions: text("instructions"),
  completedToday: boolean("completed_today").notNull().default(false),
  lastCompletedAt: timestamp("last_completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFeedingScheduleSchema = createInsertSchema(feedingSchedulesTable).omit({ id: true, createdAt: true });
export type InsertFeedingSchedule = z.infer<typeof insertFeedingScheduleSchema>;
export type FeedingSchedule = typeof feedingSchedulesTable.$inferSelect;

export const medicationsTable = pgTable("medications", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  timeOfDay: text("time_of_day"),
  notes: text("notes"),
  refillDate: text("refill_date"),
  givenToday: boolean("given_today").notNull().default(false),
  lastGivenAt: timestamp("last_given_at"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMedicationSchema = createInsertSchema(medicationsTable).omit({ id: true, createdAt: true });
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medicationsTable.$inferSelect;

export const walksTable = pgTable("walks", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  startedAt: text("started_at").notNull(),
  durationMinutes: integer("duration_minutes"),
  distanceKm: real("distance_km"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalkSchema = createInsertSchema(walksTable).omit({ id: true, createdAt: true });
export type InsertWalk = z.infer<typeof insertWalkSchema>;
export type Walk = typeof walksTable.$inferSelect;

export const groomingSchedulesTable = pgTable("grooming_schedules", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  frequencyDays: integer("frequency_days").notNull(),
  lastDoneAt: text("last_done_at"),
  nextDueAt: text("next_due_at"),
  notes: text("notes"),
  completedToday: boolean("completed_today").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGroomingScheduleSchema = createInsertSchema(groomingSchedulesTable).omit({ id: true, createdAt: true });
export type InsertGroomingSchedule = z.infer<typeof insertGroomingScheduleSchema>;
export type GroomingSchedule = typeof groomingSchedulesTable.$inferSelect;

export const vetAppointmentsTable = pgTable("vet_appointments", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  appointmentType: text("appointment_type").notNull(),
  scheduledAt: text("scheduled_at").notNull(),
  vetName: text("vet_name"),
  vetClinic: text("vet_clinic"),
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVetAppointmentSchema = createInsertSchema(vetAppointmentsTable).omit({ id: true, createdAt: true });
export type InsertVetAppointment = z.infer<typeof insertVetAppointmentSchema>;
export type VetAppointment = typeof vetAppointmentsTable.$inferSelect;

export const vaccinationsTable = pgTable("vaccinations", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  vaccineName: text("vaccine_name").notNull(),
  dateGiven: text("date_given").notNull(),
  nextDueDate: text("next_due_date"),
  administeredBy: text("administered_by"),
  notes: text("notes"),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVaccinationSchema = createInsertSchema(vaccinationsTable).omit({ id: true, createdAt: true });
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type Vaccination = typeof vaccinationsTable.$inferSelect;

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notesTable).omit({ id: true, createdAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;

export const weightEntriesTable = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  weightKg: real("weight_kg").notNull(),
  unit: text("unit").notNull().default("kg"),
  notes: text("notes"),
  recordedAt: text("recorded_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWeightEntrySchema = createInsertSchema(weightEntriesTable).omit({ id: true, createdAt: true });
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type WeightEntry = typeof weightEntriesTable.$inferSelect;

export const suppliesTable = pgTable("supplies", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  currentStock: real("current_stock").notNull(),
  unit: text("unit").notNull(),
  lowStockThreshold: real("low_stock_threshold").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSupplySchema = createInsertSchema(suppliesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupply = z.infer<typeof insertSupplySchema>;
export type Supply = typeof suppliesTable.$inferSelect;

export const photosTable = pgTable("photos", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  photoUrl: text("photo_url").notNull(),
  caption: text("caption"),
  milestone: text("milestone"),
  takenAt: text("taken_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPhotoSchema = createInsertSchema(photosTable).omit({ id: true, createdAt: true });
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photosTable.$inferSelect;
