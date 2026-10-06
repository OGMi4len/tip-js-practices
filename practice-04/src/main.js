"use strict";

import { demoTasks, variantTasks } from "./data.js";
import {
    findTaskById,
    setTaskCompleted,
    removeTask,
    addTask,
    updateTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import {
    renderTaskList,
    renderSummary,
    renderEmptyState,
} from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import {
    loadTasks,
    saveTasks,
    removeSavedTasks,
} from "./task-storage.js";

// ===== Определение режима =====
const params = new URLSearchParams(window.location.search);
const useVariant = params.get("dataset") === "variant";
const isCheckMode = params.get("mode") === "check";

const datasetKey = useVariant ? "variant" : "demo";
const storageKey = isCheckMode
    ? `tip-js-practice-04:checks:${datasetKey}`
    : `tip-js-practice-04:${datasetKey}`;

const initialTasks = useVariant ? variantTasks : demoTasks;

// ===== Состояние =====
const loaded = loadTasks(window.localStorage, storageKey, initialTasks);
let currentTasks = loaded.tasks;
let currentFilter = "all";
let editingId = null;

// ===== DOM =====
const listEl = document.querySelector("#task-list");
const summaryEl = document.querySelector("#task-summary");
const emptyEl = document.querySelector("#empty-message");
const operationEl = document.querySelector("#operation-message");
const statusEl = document.querySelector("#status-message");
const filtersEl = document.querySelector("#task-filters");
const formEl = document.querySelector("#task-form");
const formTitleEl = document.querySelector("#form-title");
const submitBtn = document.querySelector("#form-submit");
const cancelBtn = document.querySelector("#form-cancel");
const resetBtn = document.querySelector("#reset-storage");
const idInput = formEl.querySelector('input[name="id"]');
const titleInput = formEl.querySelector('input[name="title"]');
const prioritySelect = formEl.querySelector('select[name="priority"]');

function showStatus(text) {
    statusEl.textContent = text;
    statusEl.hidden = text === "";
}

function showOperation(text) {
    operationEl.textContent = text;
    operationEl.hidden = text === "";
}

function clearFormErrors() {
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
}

function showFormErrors(errors) {
    clearFormErrors();
    for (const [field, message] of Object.entries(errors)) {
        const el = document.querySelector(`[data-error="${field}"]`);
        if (el) el.textContent = message;
    }
}

function persist() {
    const res = saveTasks(window.localStorage, storageKey, currentTasks);
    if (!res.ok) {
        showOperation(`Предупреждение: ${res.error}. Изменения могут быть потеряны после перезагрузки.`);
    }
}

function renderApp() {
    const visible = getVisibleTasks(currentTasks, currentFilter);
    renderTaskList(listEl, visible);
    renderSummary(summaryEl, currentTasks, visible.length);
    renderEmptyState(emptyEl, currentTasks.length, visible.length);

    filtersEl.querySelectorAll("button[data-filter]").forEach((btn) => {
        const isActive = btn.dataset.filter === currentFilter;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
    });
}

function restoreTaskFocus(id, action) {
    const btn = listEl.querySelector(`li[data-task-id="${id}"] button[data-action="${action}"]`);
    if (btn) {
        btn.focus();
    } else {
        const active = filtersEl.querySelector("button.is-active");
        if (active) active.focus();
    }
}

// ===== Режимы формы =====
function setFormMode(id) {
    clearFormErrors();

    if (id === null) {
        editingId = null;
        formEl.reset();
        idInput.disabled = false;
        formTitleEl.textContent = "Добавление задачи";
        submitBtn.textContent = "Добавить задачу";
        cancelBtn.hidden = true;
        idInput.focus();
        return;
    }

    const task = findTaskById(currentTasks, id);
    if (!task) {
        showOperation(`Ошибка: задача с id=${id} не найдена`);
        return;
    }

    editingId = id;
    idInput.value = String(task.id);
    idInput.disabled = true;
    titleInput.value = task.title;
    prioritySelect.value = task.priority;
    formTitleEl.textContent = "Редактирование задачи";
    submitBtn.textContent = "Сохранить изменения";
    cancelBtn.hidden = false;
    titleInput.focus();
}

// ===== Обработчики =====
function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(formEl);
    const draft = {
        id: formData.get("id"),
        title: formData.get("title"),
        priority: formData.get("priority"),
    };

    const validation = validateTaskDraft(draft, currentTasks, editingId);
    if (!validation.ok) {
        showFormErrors(validation.errors);
        return;
    }

    const { id, title, priority } = validation.value;

    const result = editingId === null
        ? addTask(currentTasks, id, title, priority)
        : updateTask(currentTasks, id, title, priority);

    if (!result.ok) {
        showOperation(`Ошибка: ${result.error}`);
        return;
    }

    currentTasks = result.tasks;
    showOperation("");
    persist();
    setFormMode(null);
    renderApp();
}

function handleTaskListClick(event) {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button[data-action]");
    if (!button || !listEl.contains(button)) return;

    const action = button.dataset.action;
    if (!["toggle", "edit", "delete"].includes(action)) return;

    const card = button.closest("li[data-task-id]");
    if (!card) return;

    const id = Number(card.dataset.taskId);
    if (!Number.isSafeInteger(id) || id <= 0) {
        showOperation("Ошибка: некорректный идентификатор задачи");
        return;
    }

    if (action === "edit") {
        setFormMode(id);
        return;
    }

    const task = findTaskById(currentTasks, id);
    if (!task) {
        showOperation(`Ошибка: задача с id=${id} не найдена`);
        return;
    }

    const result = action === "toggle"
        ? setTaskCompleted(currentTasks, id, !task.completed)
        : removeTask(currentTasks, id);

    if (!result.ok) {
        showOperation(`Ошибка: ${result.error}`);
        return;
    }

    currentTasks = result.tasks;
    showOperation("");
    persist();

    if (action === "delete" && editingId === id) {
        setFormMode(null);
    }

    renderApp();
    restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button[data-filter]");
    if (!button || !filtersEl.contains(button)) return;

    const filter = button.dataset.filter;
    if (!["all", "pending", "completed"].includes(filter)) return;

    currentFilter = filter;
    showOperation("");
    renderApp();
}

function handleResetClick() {
    const res = removeSavedTasks(window.localStorage, storageKey);
    if (!res.ok) {
        showOperation(`Ошибка: ${res.error}`);
        return;
    }

    currentTasks = initialTasks.map((t) => ({ ...t }));
    currentFilter = "all";
    setFormMode(null);
    showOperation("");
    showStatus("Сохранённые данные сброшены. Восстановлен исходный набор.");
    renderApp();
}

// ===== Обработчики input для сброса ошибок поля =====
formEl.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)) return;
    const name = event.target.name;
    if (!name) return;
    const errEl = document.querySelector(`[data-error="${name}"]`);
    if (errEl) errEl.textContent = "";
});

// ===== Подписки =====
listEl.addEventListener("click", handleTaskListClick);
filtersEl.addEventListener("click", handleFilterClick);
formEl.addEventListener("submit", handleFormSubmit);
cancelBtn.addEventListener("click", () => setFormMode(null));
resetBtn.addEventListener("click", handleResetClick);

// ===== Первичная загрузка =====
if (loaded.source === "storage") {
    showStatus("Данные восстановлены из localStorage.");
} else if (loaded.ok === false && loaded.error) {
    showStatus(`Предупреждение: ${loaded.error}. Показан исходный набор.`);
}

setFormMode(null);
renderApp();