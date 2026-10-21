import { STORAGE_KEYS } from '../storageKeys';
import { readJsonItem, writeJsonItem } from '../storageService';

export const CURRENT_SCHEMA_VERSION = 1;

interface SchemaVersionRecord {
  version: number;
}

export function readStoredSchemaVersion(): number {
  const result = readJsonItem<SchemaVersionRecord>(STORAGE_KEYS.version);

  if (!result.success || !result.data || typeof result.data.version !== 'number') {
    return 0;
  }

  return result.data.version;
}

function writeStoredSchemaVersion(version: number): void {
  writeJsonItem<SchemaVersionRecord>(STORAGE_KEYS.version, { version });
}

type Migration = {
  toVersion: number;
  migrate: () => void;
};

const migrations: Migration[] = [
  {
    toVersion: 1,
    migrate: () => {
      // Initial schema: version marker only. Existing keys are preserved as-is.
    },
  },
];

export function runStorageMigrations(): void {
  let currentVersion = readStoredSchemaVersion();

  for (const migration of migrations) {
    if (currentVersion >= migration.toVersion) {
      continue;
    }

    migration.migrate();
    currentVersion = migration.toVersion;
    writeStoredSchemaVersion(currentVersion);
  }
}
