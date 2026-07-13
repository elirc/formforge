import { builderReducer, createField, initialBuilderState, type FieldKind, type FormSchema } from "@formforge/core";
import { useReducer, useRef } from "react";
import { FormRenderer } from "./FormRenderer.js";

const palette: readonly Readonly<{ kind: FieldKind; label: string; symbol: string }>[] = [
  { kind: "text", label: "Short text", symbol: "Aa" },
  { kind: "email", label: "Email", symbol: "@" },
  { kind: "number", label: "Number", symbol: "01" },
  { kind: "choice", label: "Choice", symbol: "◉" },
  { kind: "checkbox", label: "Checkbox", symbol: "✓" },
  { kind: "date", label: "Date", symbol: "□" },
  { kind: "content", label: "Content", symbol: "¶" },
];

export function FormBuilder({ initialSchema, onSchemaChange }: { initialSchema?: FormSchema; onSchemaChange?: (schema: FormSchema) => void }) {
  const [state, dispatch] = useReducer(builderReducer, initialSchema ? { schema: initialSchema, selectedFieldId: initialSchema.fields[0]?.id } : initialBuilderState);
  const sequence = useRef(state.schema.fields.length);
  const selected = state.schema.fields.find((field) => field.id === state.selectedFieldId);

  function send(action: Parameters<typeof builderReducer>[1]) {
    const next = builderReducer(state, action);
    dispatch(action);
    onSchemaChange?.(next.schema);
  }

  function nextId(kind: FieldKind) {
    sequence.current += 1;
    return `${kind}-${sequence.current}`;
  }

  return (
    <section className="builder" aria-label="Form builder">
      <aside className="field-palette" aria-labelledby="palette-heading">
        <p className="eyebrow">Field library</p>
        <h2 id="palette-heading">Add a block</h2>
        <div className="palette-grid">
          {palette.map((item) => <button key={item.kind} type="button" onClick={() => send({ type: "field.add", field: createField(item.kind, nextId(item.kind)) })}><span aria-hidden="true">{item.symbol}</span>{item.label}</button>)}
        </div>
      </aside>

      <div className="builder-canvas">
        <div className="canvas-heading"><div><p className="eyebrow">Structure</p><h2>{state.schema.fields.length} fields</h2></div><span>Draft</span></div>
        <ol className="field-list">
          {state.schema.fields.map((field, index) => (
            <li key={field.id} className={field.id === state.selectedFieldId ? "selected" : ""}>
              <button type="button" onClick={() => send({ type: "field.select", fieldId: field.id })}><span>{String(index + 1).padStart(2, "0")}</span><strong>{field.label}</strong><small>{field.kind}</small></button>
            </li>
          ))}
        </ol>
      </div>

      <aside className="field-settings" aria-labelledby="settings-heading">
        <p className="eyebrow">Settings</p>
        <h2 id="settings-heading">{selected ? "Edit field" : "Select a field"}</h2>
        {selected && <>
          <label htmlFor="field-label">Label</label>
          <input id="field-label" value={selected.label} onChange={(event) => send({ type: "field.update", fieldId: selected.id, patch: { label: event.currentTarget.value } })} />
          <label htmlFor="field-description">Description</label>
          <textarea id="field-description" value={selected.description} onChange={(event) => send({ type: "field.update", fieldId: selected.id, patch: { description: event.currentTarget.value } })} />
          <div className="settings-actions">
            <button type="button" onClick={() => send({ type: "field.duplicate", fieldId: selected.id, newId: nextId(selected.kind) })}>Duplicate</button>
            <button className="danger" type="button" onClick={() => send({ type: "field.remove", fieldId: selected.id })}>Delete</button>
          </div>
        </>}
      </aside>

      <div className="builder-preview"><FormRenderer schema={state.schema} /></div>
    </section>
  );
}
