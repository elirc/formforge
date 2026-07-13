import { z } from "zod";

const identity = { id: z.string().min(1), label: z.string().min(1), description: z.string().default(""), required: z.boolean().default(false) };
const textField = z.object({ ...identity, kind: z.literal("text"), placeholder: z.string().default(""), maxLength: z.number().int().positive().max(10_000).default(500) });
const emailField = z.object({ ...identity, kind: z.literal("email"), placeholder: z.string().default("") });
const numberField = z.object({ ...identity, kind: z.literal("number"), minimum: z.number().optional(), maximum: z.number().optional() });
const choiceField = z.object({ ...identity, kind: z.literal("choice"), options: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(1) });
const checkboxField = z.object({ ...identity, kind: z.literal("checkbox"), consentLabel: z.string().min(1) });
const dateField = z.object({ ...identity, kind: z.literal("date"), earliest: z.string().optional(), latest: z.string().optional() });
const contentField = z.object({ id: z.string().min(1), kind: z.literal("content"), label: z.string().min(1), description: z.string().default(""), required: z.literal(false).default(false), body: z.string().min(1) });

const fieldParser = z.discriminatedUnion("kind", [textField, emailField, numberField, choiceField, checkboxField, dateField, contentField]);
const formParser = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  fields: z.array(fieldParser),
});

export type Field = z.infer<typeof fieldParser>;
export type FieldKind = Field["kind"];
export type FormSchema = z.infer<typeof formParser>;

export function parseFormSchema(input: unknown): FormSchema {
  return formParser.parse(input);
}

export const demoForm: FormSchema = {
  id: "customer-research",
  title: "Customer research",
  description: "Help the product team understand how you work.",
  fields: [
    { id: "name", kind: "text", label: "Your name", description: "How should we address you?", required: true, placeholder: "Ada Lovelace", maxLength: 120 },
    { id: "email", kind: "email", label: "Work email", description: "We will only use this for follow-up.", required: true, placeholder: "ada@example.com" },
    { id: "role", kind: "choice", label: "Your role", description: "Choose the closest match.", required: false, options: [{ id: "engineering", label: "Engineering" }, { id: "design", label: "Design" }, { id: "product", label: "Product" }] },
    { id: "consent", kind: "checkbox", label: "Research consent", description: "", required: true, consentLabel: "I agree to be contacted about this research." },
  ],
};
