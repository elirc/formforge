import type { Field, FormSchema } from "@formforge/core";
import type { ReactNode } from "react";

function unreachable(value: never): never {
  throw new Error(`Unhandled field variant: ${JSON.stringify(value)}`);
}

function hint(field: Field) {
  if (!field.description) return undefined;
  return <p className="field-hint" id={`${field.id}-hint`}>{field.description}</p>;
}

function control(field: Field): ReactNode {
  const describedBy = field.description ? `${field.id}-hint` : undefined;
  switch (field.kind) {
    case "text": return <input id={field.id} type="text" placeholder={field.placeholder} maxLength={field.maxLength} required={field.required} aria-describedby={describedBy} />;
    case "email": return <input id={field.id} type="email" placeholder={field.placeholder} required={field.required} aria-describedby={describedBy} />;
    case "number": return <input id={field.id} type="number" min={field.minimum} max={field.maximum} required={field.required} aria-describedby={describedBy} />;
    case "choice": return <select id={field.id} required={field.required} aria-describedby={describedBy}><option value="">Select an option</option>{field.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>;
    case "checkbox": return <label className="checkbox-control"><input id={field.id} type="checkbox" required={field.required} aria-describedby={describedBy} /><span>{field.consentLabel}</span></label>;
    case "date": return <input id={field.id} type="date" min={field.earliest} max={field.latest} required={field.required} aria-describedby={describedBy} />;
    case "content": return <div className="content-block"><h3>{field.label}</h3><p>{field.body}</p></div>;
    default: return unreachable(field);
  }
}

export function FormRenderer({ schema }: { schema: FormSchema }) {
  return (
    <form className="form-preview" aria-labelledby={`${schema.id}-title`} onSubmit={(event) => event.preventDefault()}>
      <div className="preview-header">
        <p className="eyebrow">Live preview</p>
        <h2 id={`${schema.id}-title`}>{schema.title}</h2>
        <p>{schema.description}</p>
      </div>
      <div className="field-stack">
        {schema.fields.map((field) => field.kind === "content" ? <section key={field.id}>{control(field)}</section> : (
          <div className="field-control" key={field.id}>
            {field.kind !== "checkbox" && <label htmlFor={field.id}>{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>}
            {hint(field)}
            {control(field)}
          </div>
        ))}
      </div>
      <button className="primary-action" type="submit">Submit response</button>
    </form>
  );
}
