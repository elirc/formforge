import { isFieldVisible, validateResponse, type AnswerValue, type Field, type FormSchema, type ResponseErrors, type VisibilityRule } from "@formforge/core";
import { useState, type FormEvent, type ReactNode } from "react";

function unreachable(value: never): never {
  throw new Error(`Unhandled field variant: ${JSON.stringify(value)}`);
}

function hint(field: Field) {
  if (!field.description) return undefined;
  return <p className="field-hint" id={`${field.id}-hint`}>{field.description}</p>;
}

function control(field: Field, error: string | undefined, answer: AnswerValue | undefined): ReactNode {
  const describedBy = [field.description ? `${field.id}-hint` : "", error ? `${field.id}-error` : ""].filter(Boolean).join(" ") || undefined;
  const common = { name: field.id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) };
  switch (field.kind) {
    case "text": return <input {...common} id={field.id} type="text" placeholder={field.placeholder} maxLength={field.maxLength} defaultValue={typeof answer === "string" ? answer : ""} />;
    case "email": return <input {...common} id={field.id} type="email" placeholder={field.placeholder} defaultValue={typeof answer === "string" ? answer : ""} />;
    case "number": return <input {...common} id={field.id} type="number" min={field.minimum} max={field.maximum} defaultValue={typeof answer === "string" ? answer : ""} />;
    case "choice": return <select {...common} id={field.id} defaultValue={typeof answer === "string" ? answer : ""}><option value="">Select an option</option>{field.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>;
    case "checkbox": return <label className="checkbox-control"><input {...common} id={field.id} type="checkbox" value="yes" defaultChecked={answer === true} /><span>{field.consentLabel}</span></label>;
    case "date": return <input {...common} id={field.id} type="date" min={field.earliest} max={field.latest} defaultValue={typeof answer === "string" ? answer : ""} />;
    case "content": return <div className="content-block"><h3>{field.label}</h3><p>{field.body}</p></div>;
    default: return unreachable(field);
  }
}

export function FormRenderer({ schema, rules = [], initialAnswers = {}, onValidSubmit, submitLabel = "Submit response" }: { schema: FormSchema; rules?: readonly VisibilityRule[]; initialAnswers?: Readonly<Record<string, AnswerValue | undefined>>; onValidSubmit?: (answers: Readonly<Record<string, AnswerValue | undefined>>) => void; submitLabel?: string }) {
  const [errors, setErrors] = useState<ResponseErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Readonly<Record<string, AnswerValue | undefined>>>(initialAnswers);
  const visibleFields = schema.fields.filter((field) => isFieldVisible(field.id, rules, answers));

  function change(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (!target.name) return;
    setAnswers((current) => ({ ...current, [target.name]: target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const submittedAnswers: Record<string, AnswerValue | undefined> = {};
    for (const field of schema.fields) {
      if (field.kind === "content") continue;
      submittedAnswers[field.id] = field.kind === "checkbox" ? data.has(field.id) : String(data.get(field.id) ?? "");
    }
    const visibleSchema = { ...schema, fields: visibleFields };
    const nextErrors = validateResponse(visibleSchema, submittedAnswers);
    setErrors(nextErrors);
    const valid = Object.keys(nextErrors).length === 0;
    setSubmitted(valid);
    if (valid) onValidSubmit?.({ ...answers, ...submittedAnswers });
  }

  return (
    <form className="form-preview" aria-labelledby={`${schema.id}-title`} onChange={change} onSubmit={submit} noValidate>
      <div className="preview-header">
        <p className="eyebrow">Live preview</p>
        <h2 id={`${schema.id}-title`}>{schema.title}</h2>
        <p>{schema.description}</p>
      </div>
      {Object.keys(errors).length > 0 && <div className="error-summary" role="alert"><h3>Check your response</h3><ul>{visibleFields.flatMap((field) => errors[field.id] ? [<li key={field.id}><a href={`#${field.id}`}>{field.label}: {errors[field.id]}</a></li>] : [])}</ul></div>}
      <div className="field-stack">
        {visibleFields.map((field) => field.kind === "content" ? <section key={field.id}>{control(field, undefined, answers[field.id])}</section> : (
          <div className="field-control" key={field.id}>
            {field.kind !== "checkbox" && <label htmlFor={field.id}>{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>}
            {hint(field)}
            {control(field, errors[field.id], answers[field.id])}
            {errors[field.id] && <p className="field-error" id={`${field.id}-error`}>{errors[field.id]}</p>}
          </div>
        ))}
      </div>
      <button className="primary-action" type="submit">{submitLabel}</button>
      {submitted && <p className="success-message" role="status">Preview response is valid.</p>}
    </form>
  );
}
