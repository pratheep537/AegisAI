# Contributing to AegisAI

AegisAI is licensed under **GNU AGPL-3.0** — free for any stadium, transit authority, or organization to deploy, and all improvements stay open for the public.

## Workflow
1. Pick an open Issue and assign yourself.
2. Create a feature branch from `main`: `git checkout -b feat/short-description`
3. Run checks locally before opening a Pull Request:
   - Backend: `ruff check backend/physics/ backend/vision/ tests/ && pytest tests/ -v`
   - Frontend: `cd frontend && npm run lint && npm run build`
4. Open a PR referencing your issue (`Closes #<issue-number>`). GitHub Actions CI must pass before merge.
