import { builderReducer, createField, initialBuilderState, validateSchema, type FieldKind, type FormSchema, type VisibilityRule } from "@formforge/core";
import { useReducer, useRef, useState, type DragEvent } from "react";
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

type BuilderField = FormSchema["fields"][number];

function FieldRow({ field, index, total, selected, onSelect, onMove, onDrop }: {
  field: BuilderField;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (targetIndex: number) => void;
  onDrop: (sourceId: string, targetIndex: number) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  function restoreFieldFocus(fieldId: string) {
    window.setTimeout(() => {
      const target = [...document.querySelectorAll<HTMLButtonElement>("[data-field-select]")].find((button) => button.dataset.fieldSelect === fieldId);
      target?.focus();
    });
  }
  function beginDrag(event: DragEvent<HTMLLIElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/formforge-field", field.id);
  }
  function receiveDrop(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/formforge-field");
    if (sourceId) {
      onDrop(sourceId, index);
      restoreFieldFocus(sourceId);
    }
  }
  function moveWithFocus(targetIndex: number) {
    onMove(targetIndex);
    restoreFieldFocus(field.id);
  }

  return (
    <li className={selected ? "selected" : ""} draggable onDragStart={beginDrag} onDragOver={(event) => event.preventDefault()} onDrop={receiveDrop}>
      <div className="field-row-main">
        <span className="drag-grip" title="Drag to reorder" aria-hidden="true">⠿</span>
        <button aria-label={`Edit ${field.label}`} className="field-select" data-field-select={field.id} type="button" onClick={onSelect}><span>{String(index + 1).padStart(2, "0")}</span><strong>{field.label}</strong><small>{field.kind}</small></button>
        <div className="move-actions" aria-label={`Reorder ${field.label}`}>
          <button type="button" aria-label={`Move ${field.label} up`} disabled={index === 0} onClick={() => moveWithFocus(index - 1)}>↑</button>
          <button type="button" aria-label={`Move ${field.label} down`} disabled={index === total - 1} onClick={() => moveWithFocus(index + 1)}>↓</button>
        </div>
      </div>
      <button className="details-toggle" type="button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}>{detailsOpen ? "Hide" : "Show"} details for {field.label}</button>
      {detailsOpen && <p className="row-details">ID: {field.id}</p>}
    </li>
  );
}

export function FormBuilder({ initialSchema, onSchemaChange, rules = [] }: { initialSchema?: FormSchema; onSchemaChange?: (schema: FormSchema) => void; rules?: readonly VisibilityRule[] }) {
  const [state, dispatch] = useReducer(builderReducer, initialSchema ? { schema: initialSchema, selectedFieldId: initialSchema.fields[0]?.id } : initialBuilderState);
  const sequence = useRef(state.schema.fields.length);
  const [statusMessage, setStatusMessage] = useState("");
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "mobile">("desktop");
  const selected = state.schema.fields.find((field) => field.id === state.selectedFieldId);
  const schemaIssues = validateSchema(state.schema);

  function send(action: Parameters<typeof builderReducer>[1]) {
    const next = builderReducer(state, action);
    dispatch(action);
    onSchemaChange?.(next.schema);
  }

  function nextId(kind: FieldKind) {
    sequence.current += 1;
    return `${kind}-${sequence.current}`;
  }

  function move(fieldId: string, targetIndex: number) {
    const field = state.schema.fields.find((item) => item.id === fieldId);
    if (!field) return;
    send({ type: "field.move", fieldId, targetIndex });
    setStatusMessage(`Moved ${field.label} to position ${targetIndex + 1}`);
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
        <div className="canvas-heading"><div><p className="eyebrow">Structure</p><h2>{state.schema.fields.length} fields</h2></div><button className="publish-button" type="button" disabled={schemaIssues.length > 0} onClick={() => setStatusMessage("Draft is ready to publish")}>Publish</button></div>
        {schemaIssues.length > 0 && <div className="schema-issues" role="status"><strong>{schemaIssues.length} publish check{schemaIssues.length === 1 ? "" : "s"}</strong><ul>{schemaIssues.map((issue) => <li key={`${issue.fieldId ?? "form"}-${issue.code}`}>{issue.message}</li>)}</ul></div>}
        <p className="sr-only" aria-live="polite">{statusMessage}</p>
        <ol className="field-list" aria-label="Form fields in order">
          {state.schema.fields.map((field, index) => (
            <FieldRow key={index} field={field} index={index} total={state.schema.fields.length} selected={field.id === state.selectedFieldId} onSelect={() => send({ type: "field.select", fieldId: field.id })} onMove={(targetIndex) => move(field.id, targetIndex)} onDrop={move} />
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
          {selected.kind !== "content" && <label className="required-setting"><input type="checkbox" checked={selected.required} onChange={(event) => send({ type: "field.require", fieldId: selected.id, required: event.currentTarget.checked })} /> Required response</label>}
          <div className="settings-actions">
            <button type="button" onClick={() => send({ type: "field.duplicate", fieldId: selected.id, newId: nextId(selected.kind) })}>Duplicate</button>
            <button className="danger" type="button" onClick={() => send({ type: "field.remove", fieldId: selected.id })}>Delete</button>
          </div>
        </>}
      </aside>

      <div className="builder-preview">
        <div className="preview-toolbar" aria-label="Preview width">
          <strong>Respondent preview</strong>{rules.length > 0 && <span className="logic-badge">{rules.length} visibility rule{rules.length === 1 ? "" : "s"}</span>}
          <div><button type="button" aria-pressed={previewWidth === "desktop"} onClick={() => setPreviewWidth("desktop")}>Desktop</button><button type="button" aria-pressed={previewWidth === "mobile"} onClick={() => setPreviewWidth("mobile")}>Mobile</button></div>
        </div>
        <div className={`preview-viewport ${previewWidth}`}><FormRenderer schema={state.schema} rules={rules} /></div>
      </div>
    </section>
  );
}
