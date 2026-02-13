/**
 * Константы приложения
 */

// Локальное хранилище
export const STORAGE_KEYS = {
    BUDGET: 'budget-storage',
    THEME: 'theme-preference',
} as const;

// Валюты
export const CURRENCIES = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
} as const;

// Настройки по умолчанию
export const DEFAULT_CURRENCY = CURRENCIES.RUB;

// Навигация
export const ROUTES = {
    HOME: '/',
    ADD_TRANSACTION: '/add',
    HISTORY: '/history',
    ANALYTICS: '/analytics',
    SETTINGS: '/settings',
} as const;

// Типы транзакций
export const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
} as const;

// Форматирование
export const DATE_FORMAT = {
    ISO: 'YYYY-MM-DD',
    DISPLAY: 'DD.MM.YYYY',
} as const;

// Размеры для виртуализации
export const VIRTUALIZATION = {
    ITEM_HEIGHT: 72,
    OVERSCAN: 5,
} as const;

// Лимиты
export const LIMITS = {
    MAX_CATEGORIES: 50,
    MAX_TRANSACTIONS_DISPLAY: 1000,
} as const;

// Environment
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
