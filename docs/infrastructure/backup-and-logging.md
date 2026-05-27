# Backup And Logging Setup

## Database backup workflow

- Script: `scripts/backup-postgres.ps1`
- Default database target:
  `host=localhost`, `port=5433`, `database=voltmart`, `user=postgres`
- Override environment variables when needed:
  `VOLTMART_DB_HOST`, `VOLTMART_DB_PORT`, `VOLTMART_DB_NAME`, `VOLTMART_DB_USER`, `PG_DUMP_PATH`
- Run with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-postgres.ps1
```

- Output location:
  `backups/voltmart-YYYYMMDD-HHMMSS.sql`

## Logging stack

- Spring Boot logging config:
  `backend/src/main/resources/logback-spring.xml`
- Active log files:
  `logs/voltmart-application.log`
  `logs/voltmart-error.log`
- Archive rotation:
  `logs/archive/`
- Rotation policy:
  daily plus size-based rollover
- Retention:
  14 days for general logs, 30 days for error logs

## Suggested production routine

1. Run the PostgreSQL backup script on a schedule.
2. Store generated SQL dumps outside the app server as well.
3. Monitor `logs/voltmart-error.log` for failed notifications, order issues, and auth errors.
4. Ship `logs/*.log` to your preferred log aggregator when deploying to a managed environment.
