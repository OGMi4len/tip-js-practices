"use strict";

import { getVisibleTasks } from "../src/task-selectors.js";
import { createTaskElement, renderTaskList } from "../src/task-view.js";

const results = [];
let passed = 0, failed = 0;

function check(name, fn) {
    try {
        fn();
        results.push(`OK   ${name}`);
        passed++;
    } catch (err) {
        results.push(`FAIL ${name}\n     ${err.message}`);
        failed++;
    }
}

function assertEqual(actual, expected, msg = "") {
    if (actual !== expected) {
        throw new Error(`${msg} | ожидалось: ${expected}, получено: ${actual}`);
    }
}

function assertDeepEqual(actual, expected, msg = "") {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) {
        throw new Error(`${msg} | ожидалось: ${b}, получено: ${a}`);
    }
}

const sample = [
    { id: 1, title: "A", completed: true, priority: "medium" },
    { id: 4, title: "B", completed: false, priority: "high" },
    { id: 7, title: "C", completed: false, priority: "low" },
];

// getVisibleTasks
check("getVisibleTasks: all", () => {
    assertEqual(getVisibleTasks(sample, "all").length, 3);
});
check("getVisibleTasks: pending", () => {
    assertDeepEqual(getVisibleTasks(sample, "pending").map((t) => t.id), [4, 7]);
});
check("getVisibleTasks: completed", () => {
    assertDeepEqual(getVisibleTasks(sample, "completed").map((t) => t.id), [1]);
});
check("getVisibleTasks: default = all", () => {
    assertEqual(getVisibleTasks(sample).length, 3);
});
check("getVisibleTasks: возвращает новый массив", () => {
    const r = getVisibleTasks(sample, "all");
    if (r === sample) throw new Error("вернулась та же ссылка");
});

// createTaskElement
check("createTaskElement: li + класс", () => {
    const el = createTaskElement(sample[0]);
    assertEqual(el.tagName, "LI");
    if (!el.classList.contains("task-card")) throw new Error("нет класса task-card");
});
check("createTaskElement: data-task-id", () => {
    const el = createTaskElement(sample[1]);
    assertEqual(el.dataset.taskId, "4");
});
check("createTaskElement: is-completed", () => {
    const el = createTaskElement(sample[0]);
    if (!el.classList.contains("is-completed")) throw new Error("нет is-completed");
});
check("createTaskElement: title через textContent", () => {
    const t = { id: 1, title: "<b>X</b>", completed: false, priority: "low" };
    const el = createTaskElement(t);
    const titleEl = el.querySelector(".task-title");
    assertEqual(titleEl.textContent, "<b>X</b>");
    assertEqual(titleEl.children.length, 0);
});
check("createTaskElement: статус 'В работе'", () => {
    const el = createTaskElement(sample[1]);
    assertEqual(el.querySelector(".task-status").textContent, "В работе");
});
check("createTaskElement: статус 'Выполнена'", () => {
    const el = createTaskElement(sample[0]);
    assertEqual(el.querySelector(".task-status").textContent, "Выполнена");
});
check("createTaskElement: приоритет 'Средний'", () => {
    const el = createTaskElement(sample[0]);
    assertEqual(el.querySelector(".task-priority").textContent, "Средний");
});
check("createTaskElement: приоритет 'Высокий'", () => {
    const el = createTaskElement(sample[1]);
    assertEqual(el.querySelector(".task-priority").textContent, "Высокий");
});
check("createTaskElement: aria-pressed", () => {
    const el = createTaskElement(sample[0]);
    const btn = el.querySelector('button[data-action="toggle"]');
    assertEqual(btn.getAttribute("aria-pressed"), "true");
});
check("createTaskElement: кнопка удаления", () => {
    const el = createTaskElement(sample[0]);
    const btn = el.querySelector('button[data-action="delete"]');
    if (!btn) throw new Error("нет кнопки удаления");
    assertEqual(btn.type, "button");
});

// renderTaskList
check("renderTaskList: 3 карточки", () => {
    const ul = document.createElement("ul");
    renderTaskList(ul, sample);
    assertEqual(ul.children.length, 3);
});
check("renderTaskList: повторный вызов не дублирует", () => {
    const ul = document.createElement("ul");
    renderTaskList(ul, sample);
    renderTaskList(ul, sample);
    assertEqual(ul.children.length, 3);
});
check("renderTaskList: [] очищает", () => {
    const ul = document.createElement("ul");
    renderTaskList(ul, sample);
    renderTaskList(ul, []);
    assertEqual(ul.children.length, 0);
});

// Отчёт
const container = document.getElementById("results");
container.textContent = results.join("\n");
document.getElementById("totals").textContent =
    `Всего: ${passed + failed}. Пройдено: ${passed}. Ошибок: ${failed}.`;