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

const api = initData(sourceData);

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render,
);

const applySearching = initSearching("search");

const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements,
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const { applyPagination, updatePagination } = initPagination(
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

async function render(action) {
  let state = collectState();
  let query = {};

  // Поиск
  query = applySearching(query, state, action);

  // Фильтрация
  query = applyFiltering(query, state, action);

  // Сортировка
  query = applySorting(query, state, action);

  // Пагинация
  query = applyPagination(query, state, action);

  const { total, items } = await api.getRecords(query);

  updatePagination(total, query);
  sampleTable.render(items);
}

const appRoot = document.querySelector("#app");
if (appRoot) {
  appRoot.appendChild(sampleTable.container);
} else {
  console.error("#app не найден в DOM");
}

async function init() {
  const indexes = await api.getIndexes();

  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers,
  });
}

init().then(render);
