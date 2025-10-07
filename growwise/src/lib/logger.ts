import { env } from './env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = env.NODE_ENV === 'development'

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, metadata } = entry
    const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    }

    const formattedMessage = this.formatMessage(entry)

    if (this.isDevelopment) {
      console.log(formattedMessage)
    } else {
      // In production, you might want to send logs to a service like LogRocket, Sentry, etc.
      console.log(formattedMessage)
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata)
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata)
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata)
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata)
  }
}

export const logger = new Logger()
