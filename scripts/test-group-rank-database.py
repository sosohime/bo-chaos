#!/usr/bin/env python3
"""Run group-ranking integration tests on a disposable Unix-socket PostgreSQL."""

import getpass
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from urllib.parse import quote, urlencode


def main():
    required = ("initdb", "pg_ctl", "createdb", "psql", "pnpm")
    missing = [name for name in required if not shutil.which(name)]
    if missing:
        raise SystemExit("Missing local tools: " + ", ".join(missing))
    repo = Path(__file__).resolve().parents[1]
    cluster_root = Path(tempfile.mkdtemp(prefix="gr-db-", dir="/tmp"))
    data = cluster_root / "data"
    port = "55917"
    started = False
    log_path = Path(tempfile.gettempdir()) / "group-rank-database-test.log"
    result_code = 1
    try:
        with log_path.open("w") as log:
            def run(args, **kwargs):
                return subprocess.run(args, cwd=repo, stdout=log, stderr=subprocess.STDOUT, **kwargs)

            run(["initdb", "-D", str(data), "--no-locale", "--encoding=UTF8", "--auth-local=peer", "--auth-host=reject"], check=True)
            run(["pg_ctl", "-D", str(data), "-l", str(cluster_root / "server.log"), "-o", f"-h '' -k {cluster_root} -p {port}", "-w", "start"], check=True)
            started = True
            run(["createdb", "-h", str(cluster_root), "-p", port, "group_rank_test"], check=True)
            for migration_name in ["20261026000000_group_rank_direct_entry", "20261030000000_group_rank_custom_profile", "20261030010000_group_rank_proxy", "20261030020000_group_rank_theme", "20261114000000_group_rank_background", "20261116000000_group_rank_color", "20261123000000_group_rank_recommendations"]:
                migration = repo / "packages/prisma-client/prisma/migrations" / migration_name / "migration.sql"
                run(["psql", "-h", str(cluster_root), "-p", port, "-d", "group_rank_test", "-v", "ON_ERROR_STOP=1", "-f", str(migration)], check=True)
            test_env = os.environ.copy()
            test_env["GROUP_RANK_TEST_DATABASE_URL"] = (
                f"postgresql://{quote(getpass.getuser(), safe='')}@localhost:{port}/group_rank_test?"
                + urlencode({"host": str(cluster_root)})
            )
            result = run(["pnpm", "-C", "apps/backend-nest", "test", "--", "--runInBand", "group-rank.database.spec.ts"], env=test_env, timeout=120)
            result_code = result.returncode
    finally:
        if started:
            subprocess.run(["pg_ctl", "-D", str(data), "-m", "fast", "-w", "stop"], check=True, stdout=subprocess.DEVNULL)
        shutil.rmtree(cluster_root)
    lines = log_path.read_text().splitlines()
    for line in lines:
        if line.startswith(("PASS", "FAIL", "Test Suites:", "Tests:", "Time:")):
            print(line)
    if result_code:
        print(f"Full test output: {log_path}")
        for line in lines[-25:]:
            print(line[:250])
    print("Temporary PostgreSQL stopped and removed.")
    return result_code


if __name__ == "__main__":
    raise SystemExit(main())
