// Simple logging utility

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

// In-memory log buffer (last 1000 entries)
const logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 1000;

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  error?: Error
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  };
}

function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

function formatLogEntry(entry: LogEntry): string {
  let output = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
  
  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` | ${JSON.stringify(entry.context)}`;
  }
  
  if (entry.error) {
    output += ` | Error: ${entry.error.message}`;
    if (entry.error.stack) {
      output += `\n${entry.error.stack}`;
    }
  }
  
  return output;
}

export const logger = {
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      const entry = createLogEntry('debug', message, context);
      addToBuffer(entry);
      console.debug(formatLogEntry(entry));
    }
  },
  
  info: (message: string, context?: Record<string, any>) => {
    const entry = createLogEntry('info', message, context);
    addToBuffer(entry);
    console.info(formatLogEntry(entry));
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    const entry = createLogEntry('warn', message, context);
    addToBuffer(entry);
    console.warn(formatLogEntry(entry));
  },
  
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    const entry = createLogEntry('error', message, context, error);
    addToBuffer(entry);
    console.error(formatLogEntry(entry));
  },
  
  // Get recent logs
  getRecent: (count: number = 100): LogEntry[] => {
    return logBuffer.slice(-count);
  },
  
  // Get logs by level
  getByLevel: (level: LogLevel, count: number = 100): LogEntry[] => {
    return logBuffer.filter(e => e.level === level).slice(-count);
  },
  
  // Clear buffer
  clear: (): void => {
    logBuffer.length = 0;
  },
};

// Performance monitoring
export function withPerformance<T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<T> {
  const start = performance.now();
  
  return fn()
    .then((result) => {
      const duration = performance.now() - start;
      logger.info(`${operationName} completed`, { duration: `${duration.toFixed(2)}ms` });
      return result;
    })
    .catch((error) => {
      const duration = performance.now() - start;
      logger.error(`${operationName} failed`, error, { duration: `${duration.toFixed(2)}ms` });
      throw error;
    });
}
