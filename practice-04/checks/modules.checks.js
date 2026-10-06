"use strict";

import assert from "node:assert/strict";
import { validateTaskDraft } from "../src/form-validation.js";
import {
    isValidTaskList,
    loadTasks,
    saveTasks,
    removeSavedTasks,
} from "../src/task-storage.js";

let passed = 0;
let failed = 0;

function check(name, fn) {
    try {
        fn();
        console.log(`OK   ${name}`);
        passed++;
    } catch (err) {
        console.log(`FAIL ${name}`);
        console.log(`     ${err.message}`);
        failed++;
    }
}

const sample = [
    { id: 1, title: "A", completed: false, priority: "low" },
    { id: 2, title: "B", completed: true, priority: "high" },
];

function makeMockStorage(initial = {}) {
    const map = new Map(Object.entries(initial));
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, v),
        removeItem: (k) => map.delete(k),
        _map: map,
    };
}

// ==================== validateTaskDraft ====================

check("draft: успешное создание", () => {
    const r = validateTaskDraft({ id: "10", title: "Задача", priority: "high" }, sample);
    assert.equal(r.ok, true);
    assert.deepEqual(r.value, { id: 10, title: "Задача", priority: "high" });
});

check("draft: пустой id", () => {
    const r = validateTaskDraft({ id: "", title: "X", priority: "low" }, sample);
    assert.equal(r.ok, false);
    assert.ok(r.errors.id);
});

check("draft: id=0", () => {
    const r = validateTaskDraft({ id: "0", title: "X", priority: "low" }, sample);
    assert.equal(r.ok, false);
    assert.ok(r.errors.id);
});

check("draft: отрицательный id", () => {
    const r = validateTaskDraft({ id: "-1", title: "X", priority: "low" }, sample);
    assert.equal(r.ok, false);
});

check("draft: дробный id", () => {
    const r = validateTaskDraft({ id: "1.5", title: "X", priority: "low" }, sample);
    assert.equal(r.ok, false);
});

check("draft: id = 'abc'", () => {
    const r = validateTaskDraft({ id: "abc", title: "X", priority: "low" }, sample);
    assert.equal(r.ok, false);
});

check("draft: дубликат id", () => {
    const r = validateTaskDraft({ id: "1", title: "X", priority: "low" }, sample);
    assert.equal(r.ok, false);
    assert.ok(r.errors.id);
});

check("draft: пустое название", () => {
    const r = validateTaskDraft({ id: "10", title: "", priority: "low" }, sample);
    assert.equal(r.ok, false);
    assert.ok(r.errors.title);
});

check("draft: название из пробелов", () => {
    const r = validateTaskDraft({ id: "10", title: "   ", priority: "low" }, sample);
    assert.equal(r.ok, false);
    assert.ok(r.errors.title);
});

check("draft: название 101 символов", () => {
    const r = validateTaskDraft({ id: "10", title: "x".repeat(101), priority: "low" }, sample);
    assert.equal(r.ok, false);
    assert.ok(r.errors.title);
});

check("draft: название ровно 100 символов — успех", () => {
    const r = validateTaskDraft({ id: "10", title: "x".repeat(100), priority: "low" }, sample);
    assert.equal(r.ok, true);
    assert.equal(r.value.title.length, 100);
});

check("draft: trim названия", () => {
    const r = validateTaskDraft({ id: "10", title: "  Привет  ", priority: "low" }, sample);
    assert.equal(r.ok, true);
    assert.equal(r.value.title, "Привет");
});

check("draft: неизвестный приоритет", () => {
    const r = validateTaskDraft({ id: "10", title: "X", priority: "urgent" }, sample);
    assert.equal(r.ok, false);
    assert.ok(r.errors.priority);
});

check("draft: три ошибки сразу", () => {
    const r = validateTaskDraft({ id: "", title: "", priority: "urgent" }, sample);
    assert.equal(r.ok, false);
    assert.ok(r.errors.id && r.errors.title && r.errors.priority);
});

check("draft: редактирование — id берётся из editingId", () => {
    const r = validateTaskDraft({ id: "999", title: "Новое", priority: "high" }, sample, 1);
    assert.equal(r.ok, true);
    assert.equal(r.value.id, 1);
    assert.equal(r.value.title, "Новое");
    assert.equal(r.value.priority, "high");
});

check("draft: редактирование — задачи нет", () => {
    const r = validateTaskDraft({ id: "1", title: "X", priority: "low" }, sample, 999);
    assert.equal(r.ok, false);
    assert.ok(r.errors.id);
});

check("draft: редактирование — тот же id не дубликат", () => {
    const r = validateTaskDraft({ id: "1", title: "Новое", priority: "low" }, sample, 1);
    assert.equal(r.ok, true);
});

// ==================== isValidTaskList ====================

check("isValidTaskList: корректный", () => {
    assert.equal(isValidTaskList(sample), true);
});

check("isValidTaskList: не массив", () => {
    assert.equal(isValidTaskList({}), false);
    assert.equal(isValidTaskList(null), false);
    assert.equal(isValidTaskList("[]"), false);
});

check("isValidTaskList: пустой массив — валиден", () => {
    assert.equal(isValidTaskList([]), true);
});

check("isValidTaskList: дубликат id", () => {
    const dup = [sample[0], { ...sample[0] }];
    assert.equal(isValidTaskList(dup), false);
});

check("isValidTaskList: плохой id", () => {
    assert.equal(isValidTaskList([{ id: 0, title: "X", completed: false, priority: "low" }]), false);
    assert.equal(isValidTaskList([{ id: "1", title: "X", completed: false, priority: "low" }]), false);
});

check("isValidTaskList: плохой title", () => {
    assert.equal(isValidTaskList([{ id: 1, title: "   ", completed: false, priority: "low" }]), false);
    assert.equal(isValidTaskList([{ id: 1, title: 42, completed: false, priority: "low" }]), false);
});

check("isValidTaskList: плохой completed", () => {
    assert.equal(isValidTaskList([{ id: 1, title: "X", completed: "false", priority: "low" }]), false);
});

check("isValidTaskList: плохой priority", () => {
    assert.equal(isValidTaskList([{ id: 1, title: "X", completed: false, priority: "urgent" }]), false);
});

// ==================== loadTasks ====================

check("loadTasks: ключ отсутствует — initial", () => {
    const storage = makeMockStorage();
    const r = loadTasks(storage, "missing", sample);
    assert.equal(r.ok, true);
    assert.equal(r.source, "initial");
    assert.deepEqual(r.tasks, sample);
});

check("loadTasks: корректная запись — storage", () => {
    const storage = makeMockStorage({
        k: JSON.stringify({ version: 1, tasks: sample }),
    });
    const r = loadTasks(storage, "k", []);
    assert.equal(r.ok, true);
    assert.equal(r.source, "storage");
    assert.deepEqual(r.tasks, sample);
});

check("loadTasks: повреждённый JSON — fallback", () => {
    const storage = makeMockStorage({ k: "{broken-json" });
    const r = loadTasks(storage, "k", sample);
    assert.equal(r.ok, false);
    assert.equal(r.source, "fallback");
    assert.deepEqual(r.tasks, sample);
    assert.ok(r.error);
});

check("loadTasks: неверная версия — fallback", () => {
    const storage = makeMockStorage({
        k: JSON.stringify({ version: 999, tasks: sample }),
    });
    const r = loadTasks(storage, "k", sample);
    assert.equal(r.ok, false);
    assert.equal(r.source, "fallback");
});

check("loadTasks: невалидная схема — fallback", () => {
    const storage = makeMockStorage({
        k: JSON.stringify({ version: 1, tasks: [{ id: "bad" }] }),
    });
    const r = loadTasks(storage, "k", sample);
    assert.equal(r.ok, false);
    assert.equal(r.source, "fallback");
});

check("loadTasks: fallback — независимая копия", () => {
    const storage = makeMockStorage();
    const r = loadTasks(storage, "k", sample);
    r.tasks[0].title = "изменено";
    assert.equal(sample[0].title, "A");
});

check("loadTasks: storage.getItem бросает — fallback", () => {
    const storage = {
        getItem: () => { throw new Error("denied"); },
        setItem: () => {},
        removeItem: () => {},
    };
    const r = loadTasks(storage, "k", sample);
    assert.equal(r.ok, false);
    assert.equal(r.source, "fallback");
});

// ==================== saveTasks ====================

check("saveTasks: успех", () => {
    const storage = makeMockStorage();
    const r = saveTasks(storage, "k", sample);
    assert.equal(r.ok, true);
    const raw = storage.getItem("k");
    const parsed = JSON.parse(raw);
    assert.equal(parsed.version, 1);
    assert.equal(parsed.tasks.length, 2);
});

check("saveTasks: невалидный список отклонён", () => {
    const storage = makeMockStorage();
    const r = saveTasks(storage, "k", [{ id: "bad" }]);
    assert.equal(r.ok, false);
    assert.equal(storage.getItem("k"), null);
});

check("saveTasks: setItem бросает — ошибка", () => {
    const storage = {
        getItem: () => null,
        setItem: () => { throw new Error("quota"); },
        removeItem: () => {},
    };
    const r = saveTasks(storage, "k", sample);
    assert.equal(r.ok, false);
    assert.ok(r.error);
});

// ==================== removeSavedTasks ====================

check("removeSavedTasks: успех", () => {
    const storage = makeMockStorage({ k: "{}" });
    const r = removeSavedTasks(storage, "k");
    assert.equal(r.ok, true);
    assert.equal(storage.getItem("k"), null);
});

check("removeSavedTasks: removeItem бросает — ошибка", () => {
    const storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => { throw new Error("denied"); },
    };
    const r = removeSavedTasks(storage, "k");
    assert.equal(r.ok, false);
    assert.ok(r.error);
});

// ==================== Итог ====================

console.log(`\nПроверок пройдено: ${passed}; не пройдено: ${failed}.`);
if (failed > 0) process.exit(1);