"use strict";

import { getTaskStats } from "./task-service.js";

const PRIORITY_LABELS = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
};

export function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-card";
    li.dataset.taskId = String(task.id);
    if (task.completed) li.classList.add("is-completed");

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = task.completed ? "Выполнена" : "В работе";

    const priority = document.createElement("span");
    priority.className = "task-priority";
    priority.textContent = PRIORITY_LABELS[task.priority] ?? task.priority;

    meta.append(status, priority);
    content.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.dataset.action = "toggle";
    toggleBtn.setAttribute("aria-pressed", String(task.completed));
    const toggleLabel = document.createElement("span");
    toggleLabel.className = "action-label";
    toggleLabel.textContent = "Выполнена";
    toggleBtn.append(toggleLabel);

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.dataset.action = "edit";
    const editLabel = document.createElement("span");
    editLabel.className = "action-label";
    editLabel.textContent = "Изменить";
    editBtn.append(editLabel);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.dataset.action = "delete";
    const deleteLabel = document.createElement("span");
    deleteLabel.className = "action-label";
    deleteLabel.textContent = "Удалить";
    deleteBtn.append(deleteLabel);

    actions.append(toggleBtn, editBtn, deleteBtn);
    li.append(content, actions);
    return li;
}

export function renderTaskList(listElement, tasks) {
    const cards = tasks.map(createTaskElement);
    listElement.replaceChildren(...cards);
}

export function renderSummary(summaryElement, tasks, visibleCount) {
    const { total, completed, pending, progress } = getTaskStats(tasks);

    const setText = (selector, value) => {
        const el = summaryElement.querySelector(selector);
        if (el) el.textContent = value;
    };

    setText('[data-stat="total"]', String(total));
    setText('[data-stat="completed"]', String(completed));
    setText('[data-stat="pending"]', String(pending));
    setText('[data-stat="progress"]', `${progress.toFixed(1)}%`);
    setText('[data-stat="visible"]', String(visibleCount));
}

export function renderEmptyState(messageElement, total, visibleCount) {
    if (visibleCount > 0) {
        messageElement.textContent = "";
        messageElement.hidden = true;
        return;
    }
    if (total === 0) {
        messageElement.textContent = "Список задач пуст.";
    } else {
        messageElement.textContent = "Нет задач по выбранному фильтру.";
    }
    messageElement.hidden = false;
}