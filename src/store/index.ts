import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Category } from '../types';
import { STORAGE_KEYS } from '../constants';

interface BudgetState {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (_transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (_id: string, _transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (_id: string) => void;
  addCategory: (_category: Omit<Category, 'id'>) => void;
  updateCategory: (_id: string, _updates: Partial<Category>) => void;
  getBalance: () => number;
  getTransactionsByType: (_type: Transaction['type']) => Transaction[];
  getTransactionsByDateRange: (_start: string, _end: string) => Transaction[];
  clearAllData: () => void;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Еда', color: '#4CAF50', icon: '🍔', isQuickAccess: true },
  { id: '2', name: 'Транспорт', color: '#2196F3', icon: '🚗', isQuickAccess: true },
  { id: '3', name: 'Развлечения', color: '#FF9800', icon: '🎬', isQuickAccess: true },
  { id: '4', name: 'Здоровье', color: '#F44336', icon: '💊', isQuickAccess: false },
  { id: '5', name: 'Покупки', color: '#9C27B0', icon: '🛍️', isQuickAccess: true },
  { id: '6', name: 'Другое', color: '#607D8B', icon: '📦', isQuickAccess: false },
  { id: '7', name: 'Зарплата', color: '#4CAF50', icon: '💰', isQuickAccess: true },
  { id: '8', name: 'Подарки', color: '#E91E63', icon: '🎁', isQuickAccess: false },
  { id: '9', name: 'Мелкие траты', color: '#FFC107', icon: '💸', isQuickAccess: true },
];

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...transaction, id } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      getBalance: () => {
        const { transactions } = get();
        return transactions.reduce((sum, t) => {
          return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0);
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },

      getTransactionsByDateRange: (start, end) => {
        return get().transactions.filter(
          (t) => t.date >= start && t.date <= end
        );
      },

      clearAllData: () => {
        set({
          transactions: [],
          categories: defaultCategories,
        });
      },
    }),
    {
      name: STORAGE_KEYS.BUDGET,
    }
  )
);

