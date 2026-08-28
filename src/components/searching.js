import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
  // Создаём кастомное правило специально для этого поля.
  // Оно будет проверять только поле searchField по списку полей.
  const customSearchRule = (key, sourceValue, targetValue, source, target) => {
    // Применяем правило ТОЛЬКО если ключ совпадает с именем нашего поля поиска
    if (key !== searchField) {
      return { continue: true };
    }

    const query = targetValue;

    // Если запроса нет — пропускаем проверку (показываем всё)
    // Используем ту же логику isEmpty, что и в lib/compare.js (или простую проверку)
    if (!query || query === "" || query === null) {
      return { skip: true };
    }

    // Поля, по которым ищем
    const fieldsToCheck = ["date", "customer", "seller"];
    const caseSensitive = false;

    for (const field of fieldsToCheck) {
      if (source.hasOwnProperty(field)) {
        const val = String(source[field] ?? "");
        const q = caseSensitive ? query : query.toLowerCase();
        const v = caseSensitive ? val : val.toLowerCase();

        if (v.includes(q)) {
          return { result: true }; // Нашли совпадение в одном из полей
        }
      }
    }

    return { result: false }; // Ни в одном поле не найдено
  };

  // Инициализируем компаратор:
  // 1. Базовый набор правил (опционально, например skipEmptyTargetValues можно эмулировать внутри customSearchRule, что мы и сделали выше)
  // 2. Добавляем наше кастомное правило вторым аргументом
  const compare = createComparison([], [customSearchRule]);

  return (data, state, action) => {
    try {
      // state содержит все поля формы. Нам нужно передать объект, где ключ - это имя поля формы ('search')
      // и значение - это то, что пользователь ввёл.
      const filterState = { [searchField]: state[searchField] };

      return data.filter((row) => compare(row, filterState));
    } catch (e) {
      console.error("Ошибка в поиске:", e);
      return data; // Если ошибка - показываем всё, чтобы таблица не пропадала
    }
  };
}
