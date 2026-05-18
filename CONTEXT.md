# Àmì by Kòkò — Agent Context

## Live app
https://ami-by-koko.vercel.app

## Stack
Next.js 16, TypeScript, Tailwind CSS v4, Supabase, Paystack, Vercel

## Read these files before doing anything
- .kiro/specs/ami-koko-mvp.md
- .kiro/specs/MASTER_ROADMAP_SPEC.md
- .kiro/specs/PAYMENT_GATING_UPDATE.md
- .kiro/specs/STUDENT_AUTH_UPDATE.md
- .kiro/steering/product-identity.md
- .kiro/steering/tech-stack.md
- .kiro/steering/mvp-scope.md
- CODEBASE_SUMMARY.md

## Current status
- Phase 1 (Songs) — ✅ COMPLETE (built with Kiro)
- Phase 2 onwards — pending, start from Phase 2

## Rules — never break these
- Never touch existing working features
- TypeScript strict mode — no any types
- All new tables need RLS policies
- Service role client for privileged DB writes
- Minimum 48x48px tap targets (64x64px on student screens)
- Kòkò reacts to every interaction
- Check hasPaidAccess() before showing paid content
- School children with active school subscription bypass all payment gating