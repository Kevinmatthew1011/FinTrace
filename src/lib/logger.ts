export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= (LOG_LEVELS[currentLevel] ?? 1);
}

function formatMessage(level: LogLevel, context: string, message: string, meta?: LogMeta): string {
  const timestamp = new Date().toISOString();
  const metaString = meta && Object.keys(meta).length > 0 ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}${metaString}`;
}

export const logger = {
  debug(context: string, message: string, meta?: LogMeta) {
    if (shouldLog('debug')) {
      console.debug(`\x1b[36m${formatMessage('debug', context, message, meta)}\x1b[0m`);
    }
  },

  info(context: string, message: string, meta?: LogMeta) {
    if (shouldLog('info')) {
      console.info(`\x1b[32m${formatMessage('info', context, message, meta)}\x1b[0m`);
    }
  },

  warn(context: string, message: string, meta?: LogMeta) {
    if (shouldLog('warn')) {
      console.warn(`\x1b[33m${formatMessage('warn', context, message, meta)}\x1b[0m`);
    }
  },

  error(context: string, message: string, error?: Error | unknown, meta?: LogMeta) {
    if (shouldLog('error')) {
      const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : error;
      const combinedMeta = { ...meta, error: errorDetails };
      console.error(`\x1b[31m${formatMessage('error', context, message, combinedMeta)}\x1b[0m`);
    }
  },
};
