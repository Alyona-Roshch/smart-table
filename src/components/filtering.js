import { createComparison, defaultRules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
  // @todo: #4.1 — заполнить выпадающие списки опциями
  Object.keys(indexes).forEach((elementName) => {
    const selectElement = elements[elementName];
    if (!selectElement || selectElement.tagName !== "SELECT") return;

    // Очищаем текущие опции (кроме, возможно, заглушки), чтобы не дублировать при перерисовке
    selectElement.innerHTML = "";

    Object.values(indexes[elementName]).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      selectElement.appendChild(option);
    });
  });

  return (data, state, action) => {
    // @todo: #4.2 — обработать очистку поля
    if (action && action.name === "clear") {
      // Находим input рядом с кнопкой (родитель → ищем input с data-field)
      const parent = action.parentElement;
      if (parent) {
        const fieldName = action.dataset.field;
        const input = parent.querySelector(`input[data-field="${fieldName}"]`);
        if (input) {
          input.value = "";
          // Также сбрасываем соответствующее поле в state (если state мутабелен в контексте)
          // Но чаще всего state — это копия FormData, поэтому здесь мы просто гарантируем сброс UI.
          // Логика collectState() в main.js прочитает уже пустое значение.
        }
      }
    }

    // @todo: #4.3 — настроить компаратор
    const compare = createComparison(defaultRules);

    // @todo: #4.5 — отфильтровать данные используя компаратор
    return data.filter((row) => compare(row, state));
  };
}
