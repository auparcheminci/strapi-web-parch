import fs from 'fs';
import path from 'path';
import type { Core } from '@strapi/strapi';

const readCertFile = (filePath?: string) => {
  if (!filePath) {
    return undefined;
  }

  return fs.readFileSync(filePath, 'utf8');
};

const forceSslModeOnConnectionString = (connectionString?: string) => {
  if (!connectionString) {
    return undefined;
  }

  try {
    const connectionUrl = new URL(connectionString);
    connectionUrl.searchParams.set('sslmode', 'require');
    return connectionUrl.toString();
  } catch {
    return connectionString;
  }
};

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const mysqlSslEnabled = env.bool('DATABASE_SSL', false);

  const mysqlSsl = mysqlSslEnabled && {
    key: readCertFile(env('DATABASE_SSL_KEY_PATH', undefined)),
    cert: readCertFile(env('DATABASE_SSL_CERT_PATH', undefined)),
    ca: readCertFile(env('DATABASE_SSL_CA_PATH', undefined)),
    rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
  };

  const postgresSsl = {
    key: readCertFile(env('DATABASE_SSL_KEY_PATH', undefined)),
    cert: readCertFile(env('DATABASE_SSL_CERT_PATH', undefined)),
    ca: readCertFile(env('DATABASE_SSL_CA_PATH', '/etc/ssl/certs/ca-certificates.crt')),
    rejectUnauthorized: false,
  };

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: mysqlSsl,
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        connectionString: forceSslModeOnConnectionString(env('DATABASE_URL')),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: postgresSsl,
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

export default config;
