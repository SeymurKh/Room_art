<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Conventions

## Rendering runtime uploads (`/uploads/`)

Files uploaded at runtime via `/api/upload` land in `public/uploads/` **after** the production build, and the Next.js server does not serve them (only the nginx `location /uploads/` alias does). The `/_next/image` optimizer fetches images through the Next.js server, so any runtime upload rendered through it returns 400 and shows as a broken image.

Always render `/uploads/` paths through `RoomImage` (`src/components/room-image.tsx`), which sets `unoptimized` for them, or pass `unoptimized` explicitly when using `next/image` directly. Do not use a bare `<Image>` for runtime-uploaded media.
