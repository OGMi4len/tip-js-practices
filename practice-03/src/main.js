"use strict";

import { demoTasks, variantTasks } from "./data.js";
import {
    findTaskById,
    setTaskCompleted,
    removeTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import {
    renderTaskList,
    renderSummary,
    renderEmptyState,
} from "./task-view.js";

const params = new URLSearchParams(window.location.search);
const useVariant = params.get("dataset") === "variant";
const initialTasks = useVariant ? variantTasks : demoTasks;

let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";

const listEl = document.querySelector("#task-list");
const summaryEl = document.querySelector("#task-summary");
const emptyEl = document.querySelector("#empty-message");
const messageEl = document.querySelector("#operation-message");
const filtersEl = document.querySelector("#task-filters");

function showMessage(text) {
    messageEl.textContent = text;
    messageEl.hidden = text === "";
}

function restoreTaskFocus(id, action) {
    const selector = `li[data-task-id="${id}"] button[data-action="${action}"]`;
    const btn = listEl.querySelector(selector);
    if (btn) {
        btn.focus();
    } else {
        const active = filtersEl.querySelector("button.is-active");
        if (active) active.focus();
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

function handleTaskListClick(event) {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button[data-action]");
    if (!button || !listEl.contains(button)) return;

    const action = button.dataset.action;
    if (action !== "toggle" && action !== "delete") return;

    const card = button.closest("li[data-task-id]");
    if (!card) return;

    const id = Number(card.dataset.taskId);
    if (!Number.isSafeInteger(id) || id <= 0) {
        showMessage("Ошибка: некорректный идентификатор задачи");
        return;
    }

    const task = findTaskById(currentTasks, id);
    if (!task) {
        showMessage(`Ошибка: задача с id=${id} не найдена`);
        return;
    }

    let result;
    if (action === "toggle") {
        result = setTaskCompleted(currentTasks, id, !task.completed);
    } else {
        result = removeTask(currentTasks, id);
    }

    if (!result.ok) {
        showMessage(`Ошибка: ${result.error}`);
        return;
    }

    currentTasks = result.tasks;
    showMessage("");
    renderApp();
    restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button[data-filter]");
    if (!button || !filtersEl.contains(button)) return;

    const filter = button.dataset.filter;
    if (filter !== "all" && filter !== "pending" && filter !== "completed") return;

    currentFilter = filter;
    showMessage("");
    renderApp();
}

listEl.addEventListener("click", handleTaskListClick);
filtersEl.addEventListener("click", handleFilterClick);

renderApp();