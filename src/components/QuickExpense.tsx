import { useState, useRef, useEffect, useMemo } from 'react';
import { useBudgetStore } from '../store';
import { useToast } from '../hooks/useToast';
import { Drawer } from './ui/Drawer';
import { Input, Button } from './ui';
import { motion } from 'framer-motion';
import styles from './QuickExpense.module.css';

interface QuickExpenseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickExpense({ isOpen, onClose }: QuickExpenseProps) {
  const { addTransaction, categories, deleteTransaction, getBalance } = useBudgetStore();
  const toast = useToast();
  const [bankBalance, setBankBalance] = useState('');
  const [isApproximate, setIsApproximate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  const trackerBalance = getBalance();
  // Ищем категорию "Мелкие траты", если нет - используем "Другое"
  const smallExpensesCategory = categories.find((cat) => cat.name === 'Мелкие траты') ||
    categories.find((cat) => cat.name === 'Другое');

  const bankBalanceNum = useMemo(() => {
    const num = parseFloat(bankBalance);
    return isNaN(num) ? null : num;
  }, [bankBalance]);

  const difference = useMemo(() => {
    if (bankBalanceNum === null) return null;
    return trackerBalance - bankBalanceNum;
  }, [trackerBalance, bankBalanceNum]);



  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Сбрасываем флаг обработки при открытии формы
      isProcessingRef.current = false;
      // Небольшая задержка для анимации Drawer
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      setBankBalance('');
      setIsApproximate(false);
      // Сбрасываем флаг обработки при закрытии формы
      isProcessingRef.current = false;
    }
  }, [isOpen]);


  const handleAddDifference = () => {
    // Защита от двойного вызова - устанавливаем флаг синхронно
    if (isProcessingRef.current) {
      return;
    }
    // Устанавливаем флаг СРАЗУ, чтобы блокировать повторные вызовы
    isProcessingRef.current = true;



    if (difference === null || difference <= 0) {

      isProcessingRef.current = false; // Сбрасываем флаг при раннем выходе
      toast.error('Разница должна быть положительной');
      return;
    }

    // Используем найденную категорию "Мелкие траты" или "Другое", или любую другую категорию расходов
    const categoryToUse = smallExpensesCategory ||
      categories.find((cat) => cat.name === 'Другое') ||
      categories.find((cat) => cat.name !== 'Зарплата' && cat.name !== 'Подарки');

    if (!categoryToUse) {
      isProcessingRef.current = false; // Сбрасываем флаг при раннем выходе
      toast.error('Не найдена подходящая категория для расходов');
      return;
    }

    const newTransaction = {
      type: 'expense' as const,
      amount: difference,
      category: categoryToUse.name,
      date: new Date().toISOString().split('T')[0],
      isApproximate: isApproximate || undefined,
      comment: isApproximate
        ? 'Приблизительная сумма (разница с банком)'
        : 'Разница с балансом в банке',
    };



    // Проверяем, не была ли уже добавлена такая же транзакция (защита от двойного добавления)
    const stateBefore = useBudgetStore.getState();
    const existingTransaction = stateBefore.transactions.find(
      (t) =>
        t.type === newTransaction.type &&
        t.amount === newTransaction.amount &&
        t.category === newTransaction.category &&
        t.date === newTransaction.date &&
        // Проверяем, что транзакция была добавлена недавно (за последние 2 секунды)
        Date.now() - parseInt(t.id.slice(0, 13)) < 2000
    );

    if (existingTransaction) {
      isProcessingRef.current = false;
      return;
    }

    // Get the transaction ID after adding
    addTransaction(newTransaction);
    const stateAfter = useBudgetStore.getState();



    // Find the newly added transaction
    const newTransactionId = stateAfter.transactions.find(
      (t) =>
        !stateBefore.transactions.some((prev) => prev.id === t.id) &&
        t.type === newTransaction.type &&
        t.amount === newTransaction.amount &&
        t.category === newTransaction.category &&
        t.date === newTransaction.date
    )?.id;



    // Show toast with undo functionality
    if (newTransactionId) {
      toast.success(
        isApproximate
          ? `Добавлено ~${difference.toFixed(2)} ₽ (примерно)`
          : `Добавлено ${difference.toFixed(2)} ₽`,
        {
          onUndo: () => {
            deleteTransaction(newTransactionId);
            toast.info('Транзакция отменена');
          },
          duration: 5000,
        }
      );
    }

    setBankBalance('');
    setIsApproximate(false);
    // Сбрасываем флаг обработки после небольшой задержки, чтобы предотвратить двойной вызов
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Быстрая трата"
      position="bottom"
      size="sm"
    >
      <div className={styles.form}>
        <div className={styles.balanceInfo}>
          <div className={styles.balanceRow}>
            <span className={styles.balanceLabel}>В трекере:</span>
            <span className={styles.balanceValue}>
              {trackerBalance.toLocaleString('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ₽
            </span>
          </div>
        </div>

        <Input
          ref={inputRef}
          type="number"
          step="0.01"
          label="Текущий баланс из банка"
          placeholder="Введите сумму из уведомления банка"
          value={bankBalance}
          onChange={(e) => setBankBalance(e.target.value)}
          fullWidth
          autoFocus
        />

        {bankBalanceNum !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.differenceSection}
          >
            <div className={styles.balanceRow}>
              <span className={styles.balanceLabel}>В банке:</span>
              <span className={styles.balanceValue}>
                {bankBalanceNum.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ₽
              </span>
            </div>

            {difference !== null && (
              <div className={styles.differenceRow}>
                <span className={styles.differenceLabel}>Разница:</span>
                <span
                  className={`${styles.differenceValue} ${difference > 0 ? styles.differencePositive : styles.differenceNegative
                    }`}
                >
                  {difference > 0 ? '+' : ''}
                  {difference.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} ₽
                </span>
              </div>
            )}

            {difference !== null && difference > 0 && (
              <div className={styles.differenceHint}>
                <span className={styles.hintIcon}>💡</span>
                <span className={styles.hintText}>
                  Забыли занести траты на сумму {difference.toFixed(2)} ₽
                </span>
              </div>
            )}

            {difference !== null && difference <= 0 && (
              <div className={styles.differenceHint}>
                <span className={styles.hintIcon}>ℹ️</span>
                <span className={styles.hintText}>
                  {difference === 0
                    ? 'Балансы совпадают - все траты учтены!'
                    : 'В трекере меньше, чем в банке. Возможно, есть неучтенные доходы.'}
                </span>
              </div>
            )}
          </motion.div>
        )}

        <div className={styles.approximateToggle}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isApproximate}
              onChange={(e) => setIsApproximate(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Приблизительная сумма (забыл точную)
            </span>
          </label>
        </div>

        <div className={styles.info}>
          <span className={styles.infoIcon}>💡</span>
          <span className={styles.infoText}>
            Введите баланс из уведомления банка, и приложение посчитает разницу с вашим трекером
          </span>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="expense"
            onClick={(e) => {
              // Блокируем событие СРАЗУ, чтобы предотвратить повторную обработку
              e.preventDefault();
              e.stopPropagation();

              // Проверяем состояние difference перед выполнением
              if (difference === null || difference <= 0) {
                return;
              }

              handleAddDifference();
            }}
            fullWidth
            style={difference === null || difference <= 0 ? {
              opacity: 0.6,
              cursor: 'not-allowed'
            } : undefined}
          >
            Добавить разницу как трату
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

