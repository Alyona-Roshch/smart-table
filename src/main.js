import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const { data, ...indexes } = initData(sourceData);

// Подключаем header и filter через before: ['header', 'filter']
const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"], // search стоит первым в before
    after: ["pagination"],
  },
  render,
);

// Инициализируем поиск: передаём имя поля (должно совпадать с name="search" в шаблоне)
const applySearching = initSearching("search");

// Инициализация фильтрации
const applyFiltering = initFiltering(sampleTable.filter.elements, {
  searchBySeller: indexes.sellers,
});

// Инициализация сортировки
const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

// Инициализация пагинации
const applyPagination = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    if (input) {
      input.value = page;
      input.checked = isCurrent;
    }
    if (label) {
      label.textContent = page;
    }
    return el;
  },
);

function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  const rowsPerPage = parseInt(state.rowsPerPage, 10);
  const page = parseInt(state.page ?? 1, 10);

  return {
    ...state,
    rowsPerPage,
    page,
  };
}

function render(action) {
  let state = collectState();
  let result = [...data];

  result = applySearching(result, state, action);
  result = applyFiltering(result, state, action);
  result = applySorting(result, state, action);
  result = applyPagination(result, state, action);

  sampleTable.render(result);
}

const appRoot = document.querySelector("#app");
if (appRoot) {
  appRoot.appendChild(sampleTable.container);
} else {
  console.error("#app не найден в DOM");
}

render();
