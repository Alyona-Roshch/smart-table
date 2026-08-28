import { sortCollection, sortMap } from "../lib/sort.js";

export function initSorting(columns) {
  return (data, state, action) => {
    let field = null;
    let order = null;

    // Если действие от кнопки сортировки (action.name === 'sort')
    if (action && action.name === "sort") {
      // @todo: #3.1 — запомнить выбранный режим сортировки
      // Переключаем состояние по кругу через sortMap
      const currentValue = action.dataset.value;
      if (currentValue in sortMap) {
        action.dataset.value = sortMap[currentValue];
      }
      field = action.dataset.field;
      order = action.dataset.value;

      // @todo: #3.2 — сбросить сортировки остальных колонок
      columns.forEach((column) => {
        // Если это не та колонка, по которой кликнули — сбрасываем в 'none'
        if (column.dataset.field !== action.dataset.field) {
          column.dataset.value = "none";
        }
      });
    } else {
      // @todo: #3.3 — получить выбранный режим сортировки (для восстановления состояния при перерисовке)
      columns.forEach((column) => {
        if (column.dataset.value !== "none") {
          field = column.dataset.field;
          order = column.dataset.value;
        }
      });
    }

    return sortCollection(data, field, order);
  };
}
