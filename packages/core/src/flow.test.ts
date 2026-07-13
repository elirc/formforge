import { describe, expect, it } from "vitest";
import { answerSession, backSession, demoFormFlow, nextSession, resumeSession, serializeSession, startSession } from "./flow.js";

describe("multi-page response state machine", () => {
  it("follows the default path for an engineering respondent", () => {
    let session = startSession(demoFormFlow);
    session = nextSession(demoFormFlow, session);
    session = answerSession(session, "role", "engineering");
    session = nextSession(demoFormFlow, session);

    expect(session.currentPageId).toBe("consent");
    expect(session.visitedPageIds).toEqual(["contact", "role", "consent"]);
    expect(nextSession(demoFormFlow, session).completed).toBe(true);
  });

  it("takes the first matching branch and can complete early", () => {
    let session = nextSession(demoFormFlow, startSession(demoFormFlow));
    session = answerSession(session, "role", "design");
    session = nextSession(demoFormFlow, session);

    expect(session.completed).toBe(true);
    expect(session.visitedPageIds).toEqual(["contact", "role"]);
  });

  it("moves back through actual history rather than page-array position", () => {
    let session = nextSession(demoFormFlow, startSession(demoFormFlow));
    session = answerSession(session, "role", "engineering");
    session = nextSession(demoFormFlow, session);
    session = backSession(session);

    expect(session.currentPageId).toBe("role");
    expect(session.answers.role).toBe("engineering");
  });

  it("round-trips valid sessions and rejects corrupt resume data", () => {
    const session = nextSession(demoFormFlow, startSession(demoFormFlow));
    expect(resumeSession(demoFormFlow, serializeSession(session))).toEqual(session);
    expect(resumeSession(demoFormFlow, "not json")).toBeUndefined();
    expect(resumeSession(demoFormFlow, JSON.stringify({ ...session, currentPageId: "removed-page" }))).toBeUndefined();
  });
});
