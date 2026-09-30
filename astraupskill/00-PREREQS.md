# 00. Prerequisites: four things this course assumes

[Course index](README.md)

## pnpm workspaces

`pnpm-workspace.yaml` lists the packages (`apps/*`, `packages/*`). One `pnpm install` at the root installs all of them and links `@formforge/core` into `apps/api` and `apps/web` as if it were published, so a change in `packages/core` is visible to both apps immediately. `pnpm -r exec <cmd>` runs a command in every package; `pnpm --filter web exec vitest run` runs it in one. The lockfile is shared, which is why the install is one step and why `--frozen-lockfile` is the reproducible form.

## Turbo's task graph

`turbo.json` declares tasks (`build`, `lint`, `typecheck`, `test`) and their dependencies, for example that `build` in an app depends on `build` in the packages it imports (`"dependsOn": ["^build"]`). `turbo run test` computes that graph, runs independent tasks in parallel and caches outputs by input hash, so an unchanged package's task is replayed from cache. When something looks stale, `turbo run build --force` bypasses the cache. `--concurrency=2` bounds the parallelism on a small machine.

## `app.inject()`

The API tests never start a listening server. Fastify's `app.inject({ method, url, headers, payload })` pushes a synthetic request through the whole app (routing, hooks, validation, handlers, serialization) and returns the response object, in-process. It is faster, needs no free port, and cannot be affected by another test's server. The trade-off: anything that only happens on a real socket (TLS, keep-alive, proxies) is not covered, and you must remember that a passing `inject` test says nothing about the deployment in front of it.

## What a workspace, a form and a publication are here

A *workspace* owns forms (`x-workspace-id` names it in this demo; chapter 06 explains why that header is not authentication). A *form schema* is the editable draft with a version; a *publication* freezes one version under a slug, and the slug-ownership invariant (one slug, one workspace) is what the worked change protects. Keep those three nouns straight and the rest of the course reads easily.
