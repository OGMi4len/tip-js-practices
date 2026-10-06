"use strict";

import { demoTasks } from "../src/data.js";
import { getVisibleTasks } from "../src/task-selectors.js";
import { createTaskElement } from "../src/task-view.js";
import { validateTaskDraft } from "../src/form-validation.js";
import {
    isValidTaskList,
    loadTasks,
    saveTasks,
    removeSavedTasks,
} from "../src/task-storage.js";

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

function eq(a, b, msg = "") {
    if (a !== b) throw new Error(`${msg} | ожидалось: ${b}, получено: ${a}`);
}
function deepEq(a, b, msg = "") {
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    if (sa !== sb) throw new Error(`${msg} | ожидалось: ${sb}, получено: ${sa}`);
}

function makeMockStorage(initial = {}) {
    const map = new Map(Object.entries(initial));
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, v),
        removeItem: (k) => map.delete(k),
    };
}

// ===== 1. Карточка =====
check("Карточка: три кнопки (toggle, edit, delete)", () => {
    const el = createTaskElement(demoTasks[0]);
    const actions = el.querySelectorAll("button[data-action]");
    eq(actions.length, 3);
    const names = [...actions].map((b) => b.dataset.action).sort();
    deepEq(names, ["delete", "edit", "toggle"]);
});

check("Карточка: кнопка edit с подписью 'Изменить'", () => {
    const el = createTaskElement(demoTasks[0]);
    const label = el.querySelector('button[data-action="edit"] .action-label');
    eq(label.textContent, "Изменить");
});

check("Карточка: title через textContent", () => {
    const t = { id: 1, title: "<b>X</b>", completed: false, priority: "low" };
    const el = createTaskElement(t);
    const titleEl = el.querySelector(".task-title");
    eq(titleEl.textContent, "<b>X</b>");
    eq(titleEl.children.length, 0);
});

check("Карточка: data-task-id", () => {
    const el = createTaskElement(demoTasks[1]);
    eq(el.dataset.taskId, "4");
});

// ===== 2. Селекторы ПР3 =====
check("getVisibleTasks: all", () => eq(getVisibleTasks(demoTasks, "all").length, 4));
check("getVisibleTasks: pending", () => {
    deepEq(getVisibleTasks(demoTasks, "pending").map((t) => t.id), [4, 7]);
});
check("getVisibleTasks: completed", () => {
    deepEq(getVisibleTasks(demoTasks, "completed").map((t) => t.id), [1, 10]);
});

// ===== 3. Валидация =====
check("draft: успешное создание", () => {
    const r = validateTaskDraft({ id: "20", title: "Новая", priority: "high" }, demoTasks);
    eq(r.ok, true);
    eq(r.value.id, 20);
});

check("draft: дубликат id", () => {
    const r = validateTaskDraft({ id: "4", title: "X", priority: "low" }, demoTasks);
    eq(r.ok, false);
    if (!r.errors.id) throw new Error("нет ошибки id");
});

check("draft: пустой id", () => {
    const r = validateTaskDraft({ id: "", title: "X", priority: "low" }, demoTasks);
    eq(r.ok, false);
});

check("draft: пустое название", () => {
    const r = validateTaskDraft({ id: "20", title: "   ", priority: "low" }, demoTasks);
    eq(r.ok, false);
    if (!r.errors.title) throw new Error("нет ошибки title");
});

check("draft: неизвестный приоритет", () => {
    const r = validateTaskDraft({ id: "20", title: "X", priority: "urgent" }, demoTasks);
    eq(r.ok, false);
    if (!r.errors.priority) throw new Error("нет ошибки priority");
});

check("draft: редактирование (editingId=4)", () => {
    const r = validateTaskDraft({ id: "999", title: "Новое", priority: "high" }, demoTasks, 4);
    eq(r.ok, true);
    eq(r.value.id, 4);
});

// ===== 4. Хранилище =====
check("isValidTaskList: корректный", () => {
    eq(isValidTaskList(demoTasks), true);
});

check("isValidTaskList: дубликат id", () => {
    eq(isValidTaskList([demoTasks[0], { ...demoTasks[0] }]), false);
});

check("isValidTaskList: не массив", () => {
    eq(isValidTaskList({}), false);
});

check("saveTasks + loadTasks: круг", () => {
    const storage = makeMockStorage();
    const save = saveTasks(storage, "test", demoTasks);
    eq(save.ok, true);
    const load = loadTasks(storage, "test", []);
    eq(load.ok, true);
    eq(load.source, "storage");
    eq(load.tasks.length, 4);
});

check("loadTasks: ключ отсутствует → initial", () => {
    const storage = makeMockStorage();
    const r = loadTasks(storage, "missing", demoTasks);
    eq(r.source, "initial");
    eq(r.tasks.length, 4);
});

check("loadTasks: повреждённый JSON → fallback", () => {
    const storage = makeMockStorage({ bad: "{broken" });
    const r = loadTasks(storage, "bad", demoTasks);
    eq(r.ok, false);
    eq(r.source, "fallback");
    eq(r.tasks.length, 4);
});

check("loadTasks: неверная версия → fallback", () => {
    const storage = makeMockStorage({ v: JSON.stringify({ version: 999, tasks: demoTasks }) });
    const r = loadTasks(storage, "v", demoTasks);
    eq(r.ok, false);
});

check("removeSavedTasks: удаляет ключ", () => {
    const storage = makeMockStorage();
    saveTasks(storage, "k", demoTasks);
    removeSavedTasks(storage, "k");
    eq(storage.getItem("k"), null);
});

// ===== Итог =====
document.getElementById("results").textContent = results.join("\n");
document.getElementById("totals").textContent =
    `Всего: ${passed + failed}. Пройдено: ${passed}. Ошибок: ${failed}.`;