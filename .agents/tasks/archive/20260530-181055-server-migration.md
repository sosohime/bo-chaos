# Task Record: migrate expiring server services

- State: active
- Mode: full
- Started: 2026-05-30
- Branch: main
- Request: Migrate services from expiring server 110.42.207.230 to primary server 101.34.252.219.

## Acceptance Boundaries

- Functional: Inventory services on both servers, migrate required workloads to 101.34.252.219, and preserve service behavior.
- Verification: Verify ports, processes, service health, and any relevant HTTP endpoints after migration.
- Docs Sync: Run repo agent lint if repo docs or workflow records change.
- Safety: Do not stop old services, overwrite production configs, change DNS, or perform destructive data operations without explicit approval.
- Archive: Move this record to `.agents/tasks/archive/` when complete, blocked, or handed off.

## Actions

- Created task record for server migration.
- Inventoried source server 110.42.207.230 and target server 101.34.252.219.
- Found source server responsibilities: `yuanbo.online` nginx HTTPS/static entrypoint and `local-oss-rs` on localhost port 3399.
- Copied selected public assets and local object storage data from source `/usr/soso` to target `/usr/soso`.
- Copied `yuanbo.online` TLS certificate and key to target `/etc/nginx/ssl`.
- Installed and started `local-oss-rs.service` on target.
- Added target nginx config `/etc/nginx/conf.d/yuanbo-online-migrated.conf` for `yuanbo.online`.
- Reloaded target nginx after syntax validation.
- Removed temporary migration archives from both servers.

## Iteration Log

- N/A

## Deferred Verification

- N/A

## Decisions and Assumptions

- Treat 101.34.252.219 as the target primary server and 110.42.207.230 as the expiring source server.
- Start with read-only inventory before making remote changes.
- Preserve source server while staging target; do not stop old services or change DNS from the agent.
- Copy only externally referenced nginx assets instead of full `/usr/soso` after full tar streaming proved too slow.
- Keep `/rpg` proxied locally on target through the existing bo-chaos nginx routes.

## Files Touched

- `.agents/tasks/active/20260530-181055-server-migration.md`
- Remote target: `/etc/systemd/system/local-oss-rs.service`
- Remote target: `/etc/nginx/conf.d/yuanbo-online-migrated.conf`
- Remote target: `/etc/nginx/ssl/yuanbo.online_bundle.crt`
- Remote target: `/etc/nginx/ssl/yuanbo.online.key`
- Remote target: selected `/usr/soso/*` public asset and storage directories

## Verification Evidence

- `nginx -t` on target: successful.
- `systemctl is-active nginx local-oss-rs` on target: both active.
- Target listeners: nginx on 80/443, `local-oss-rs` on `127.0.0.1:3399`, bo-chaos app ports 3000/3001 present.
- `curl --resolve yuanbo.online:443:101.34.252.219 https://yuanbo.online/zym/`: 200.
- `curl --resolve yuanbo.online:443:101.34.252.219 https://yuanbo.online/mikutap/`: 200.
- `curl --resolve yuanbo.online:443:101.34.252.219 https://yuanbo.online/op_demo/`: 200.
- Old/new comparison for `/rpg/bofans`, `/rpg/admin`, `/static/calendar`, `/rtia`, `/bofans_static`, and `/oss_service`: matching status behavior.
- DNS check: `yuanbo.online` and `www.yuanbo.online` still resolve to `110.42.207.230`.

## Handoff / Archive Notes

- Final state: handoff
- Archive path: `.agents/tasks/archive/20260530-181055-server-migration.md`
