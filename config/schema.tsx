import { boolean, integer, json, jsonb, pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credit: integer(),
});

export const sessonChatTable = pgTable("sessonChatTable", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sessionId: varchar().notNull(),
    notes: text(),
    conversation: json(),
    selectedDoctor: json(),
    report: json(),
    createdBy: varchar().references(() => usersTable.email),
    // createdAt: timestamp("createdAt").defaultNow()
    created_at_timestamp: timestamp("created_at_timestamp").defaultNow()

})
