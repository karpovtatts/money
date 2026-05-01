// Утилита для логирования в localStorage
const DEBUG_LOG_KEY = 'debug-logs';
const MAX_LOG_ENTRIES = 200;

interface LogEntry {
  timestamp: number;
  location: string;
  message: string;
  data?: unknown;
  sessionId?: string;
  runId?: string;
  hypothesisId?: string;
}

export function debugLog(entry: Omit<LogEntry, 'timestamp'>) {
  // В production режиме не логируем
  if (import.meta.env.PROD) {
    return;
  }

  try {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: Date.now(),
    };

    // Выводим в консоль только в dev режиме
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${entry.location} - ${entry.message}`, entry.data || {});
    }

    // Сохраняем в localStorage
    const existingLogs = getLogs();
    existingLogs.push(logEntry);

    // Оставляем только последние MAX_LOG_ENTRIES записей
    if (existingLogs.length > MAX_LOG_ENTRIES) {
      existingLogs.splice(0, existingLogs.length - MAX_LOG_ENTRIES);
    }

    localStorage.setItem(DEBUG_LOG_KEY, JSON.stringify(existingLogs));
  } catch (error) {
    // Если localStorage переполнен или недоступен, просто игнорируем

    console.error('Failed to save debug log:', error);
  }
}

export function getLogs(): LogEntry[] {
  try {
    const logsStr = localStorage.getItem(DEBUG_LOG_KEY);
    if (!logsStr) return [];
    return JSON.parse(logsStr);
  } catch (error) {
    console.error('Failed to read debug logs:', error);
    return [];
  }
}

export function clearLogs() {
  try {
    localStorage.removeItem(DEBUG_LOG_KEY);
  } catch (error) {
    console.error('Failed to clear debug logs:', error);
  }
}

export function exportLogsAsText(): string {
  const logs = getLogs();
  return logs
    .map((log) => {
      const time = new Date(log.timestamp).toLocaleString('ru-RU');
      return `[${time}] ${log.location} - ${log.message}\n${JSON.stringify(log.data || {}, null, 2)}`;
    })
    .join('\n\n');
}
