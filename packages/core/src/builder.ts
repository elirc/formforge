import { demoForm, type Field, type FieldKind, type FormSchema } from "./schema.js";

export type BuilderState = Readonly<{ schema: FormSchema; selectedFieldId: string | undefined }>;
export type BuilderAction =
  | Readonly<{ type: "field.add"; field: Field }>
  | Readonly<{ type: "field.select"; fieldId: string }>
  | Readonly<{ type: "field.update"; fieldId: string; patch: Readonly<{ label?: string; description?: string }> }>
  | Readonly<{ type: "field.duplicate"; fieldId: string; newId: string }>
  | Readonly<{ type: "field.remove"; fieldId: string }>;

export const initialBuilderState: BuilderState = { schema: demoForm, selectedFieldId: demoForm.fields[0]?.id };

export function createField(kind: FieldKind, id: string): Field {
  const common = { id, label: `Untitled ${kind}`, description: "", required: false };
  switch (kind) {
    case "text": return { ...common, kind, placeholder: "", maxLength: 500 };
    case "email": return { ...common, kind, placeholder: "" };
    case "number": return { ...common, kind };
    case "choice": return { ...common, kind, options: [{ id: `${id}-option-1`, label: "Option 1" }] };
    case "checkbox": return { ...common, kind, consentLabel: "I agree" };
    case "date": return { ...common, kind };
    case "content": return { ...common, kind, required: false, body: "Add supporting context." };
  }
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "field.add": return { ...state, schema: { ...state.schema, fields: [...state.schema.fields, action.field] }, selectedFieldId: action.field.id };
    case "field.select": return state.schema.fields.some((field) => field.id === action.fieldId) ? { ...state, selectedFieldId: action.fieldId } : state;
    case "field.update": return { ...state, schema: { ...state.schema, fields: state.schema.fields.map((field) => field.id === action.fieldId ? { ...field, ...action.patch } : field) } };
    case "field.duplicate": {
      const sourceIndex = state.schema.fields.findIndex((field) => field.id === action.fieldId);
      const source = state.schema.fields[sourceIndex];
      if (!source) return state;
      const fields = [...state.schema.fields];
      fields.splice(sourceIndex + 1, 0, { ...source, id: action.newId, label: `${source.label} copy` });
      return { ...state, schema: { ...state.schema, fields }, selectedFieldId: action.newId };
    }
    case "field.remove": {
      const fields = state.schema.fields.filter((field) => field.id !== action.fieldId);
      return { ...state, schema: { ...state.schema, fields }, selectedFieldId: state.selectedFieldId === action.fieldId ? fields[0]?.id : state.selectedFieldId };
    }
  }
}
