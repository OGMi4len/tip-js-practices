import { demoTasks } from "../src/data.js";
import {
    createTask,
    findTaskById,
    getPendingTasks,
    getTaskTitles,
    getTaskStats,
    addTask,
    setTaskCompleted,
    renameTask,
    removeTask,
    updateTask
} from "../src/task-service.js";

"use strict";

import assert from "node:assert/strict";
import { demoTasks } from "./src/data.js";
import {
    createTask,
    findTaskById,
    getPendingTasks,
    getTaskTitles,
    getTaskStats,
    addTask,
    setTaskCompleted,
    renameTask,
    removeTask,
} from "./src/task-service.js";

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

// ===== createTask =====
check("createTask: обычный", () => {
    const r = createTask(20, "Новая задача", "high");
    assert.equal(r.ok, true);
    assert.equal(r.task.id, 20);
    assert.equal(r.task.completed, false);
    assert.equal(r.task.priority, "high");
});
check("createTask: приоритет по умолчанию", () => {
    const r = createTask(20, "Текст");
    assert.equal(r.task.priority, "medium");
});
check("createTask: trim названия", () => {
    const r = createTask(20, "  Проверить  данные  ");
    assert.equal(r.task.title, "Проверить  данные");
});
check("createTask: id=0 отклонён", () => {
    assert.equal(createTask(0, "X").ok, false);
});
check("createTask: id=-1 отклонён", () => {
    assert.equal(createTask(-1, "X").ok, false);
});
check("createTask: id=1.5 отклонён", () => {
    assert.equal(createTask(1.5, "X").ok, false);
});
check("createTask: id='4' отклонён", () => {
    assert.equal(createTask("4", "X").ok, false);
});
check("createTask: пустое название", () => {
    assert.equal(createTask(1, "   ").ok, false);
});
check("createTask: название 101 символ", () => {
    assert.equal(createTask(1, "x".repeat(101)).ok, false);
});
check("createTask: приоритет 'urgent'", () => {
    assert.equal(createTask(1, "X", "urgent").ok, false);
});
check("createTask: два разных объекта", () => {
    const a = createTask(1, "A").task;
    const b = createTask(1, "A").task;
    assert.notEqual(a, b);
});

// ===== чтение =====
check("findTaskById: id=4", () => {
    const t = findTaskById(demoTasks, 4);
    assert.equal(t.id, 4);
});
check("findTaskById: нет id=777", () => {
    assert.equal(findTaskById(demoTasks, 777), undefined);
});
check("findTaskById: строковый '4'", () => {
    assert.equal(findTaskById(demoTasks, "4"), undefined);
});
check("getPendingTasks: [4,7]", () => {
    const ids = getPendingTasks(demoTasks).map((t) => t.id);
    assert.deepEqual(ids, [4, 7]);
});
check("getPendingTasks: пустой результат", () => {
    const all = demoTasks.map((t) => ({ ...t, completed: true }));
    assert.deepEqual(getPendingTasks(all), []);
});
check("getTaskTitles: 4 названия", () => {
    assert.equal(getTaskTitles(demoTasks).length, 4);
});
check("getTaskTitles: []", () => {
    assert.deepEqual(getTaskTitles([]), []);
});
check("getTaskStats: demoTasks", () => {
    assert.deepEqual(getTaskStats(demoTasks), {
        total: 4, completed: 2, pending: 2, progress: 50,
    });
});
check("getTaskStats: []", () => {
    assert.deepEqual(getTaskStats([]), {
        total: 0, completed: 0, pending: 0, progress: 0,
    });
});

// ===== изменение =====
check("addTask: успех", () => {
    const r = addTask(demoTasks, 20, "Новая", "high");
    assert.equal(r.ok, true);
    assert.equal(r.tasks.length, 5);
    assert.equal(demoTasks.length, 4);
});
check("addTask: дубликат id", () => {
    const r = addTask(demoTasks, 4, "X");
    assert.equal(r.ok, false);
});
check("addTask: некорректный id", () => {
    const r = addTask(demoTasks, "4", "X");
    assert.equal(r.ok, false);
});
check("setTaskCompleted: успех", () => {
    const r = setTaskCompleted(demoTasks, 4, true);
    assert.equal(r.ok, true);
    const t = r.tasks.find((x) => x.id === 4);
    assert.equal(t.completed, true);
    const original = demoTasks.find((x) => x.id === 4);
    assert.equal(original.completed, false);
});
check("setTaskCompleted: строка 'false'", () => {
    assert.equal(setTaskCompleted(demoTasks, 4, "false").ok, false);
});
check("setTaskCompleted: 0", () => {
    assert.equal(setTaskCompleted(demoTasks, 4, 0).ok, false);
});
check("setTaskCompleted: нет задачи", () => {
    assert.equal(setTaskCompleted(demoTasks, 999, true).ok, false);
});
check("renameTask: успех с trim", () => {
    const r = renameTask(demoTasks, 10, "  Новое имя  ");
    const t = r.tasks.find((x) => x.id === 10);
    assert.equal(t.title, "Новое имя");
    assert.equal(t.priority, "medium");
    assert.equal(t.completed, true);
});
check("renameTask: пустое имя", () => {
    assert.equal(renameTask(demoTasks, 10, "  ").ok, false);
});
check("renameTask: нет задачи", () => {
    assert.equal(renameTask(demoTasks, 999, "X").ok, false);
});
check("removeTask: успех", () => {
    const r = removeTask(demoTasks, 7);
    assert.equal(r.ok, true);
    assert.deepEqual(r.tasks.map((t) => t.id), [1, 4, 10]);
    assert.equal(demoTasks.length, 4);
});
check("removeTask: нет задачи", () => {
    assert.equal(removeTask(demoTasks, 999).ok, false);
});
check("removeTask: единственная", () => {
    const one = [{ id: 1, title: "A", completed: false, priority: "low" }];
    const r = removeTask(one, 1);
    assert.deepEqual(r.tasks, []);
});

console.log(`\nПройдено: ${passed}, провалено: ${failed}`);
if (failed > 0) process.exit(1);
import { updateTask } from "../src/task-service.js";

check("updateTask: успех", () => {
    const r = updateTask(demoTasks, 4, "Новое имя", "low");
    assert.equal(r.ok, true);
    const t = r.tasks.find((x) => x.id === 4);
    assert.equal(t.title, "Новое имя");
    assert.equal(t.priority, "low");
    assert.equal(t.completed, false);
});
check("updateTask: сохраняет completed=true", () => {
    const r = updateTask(demoTasks, 1, "X", "high");
    const t = r.tasks.find((x) => x.id === 1);
    assert.equal(t.completed, true);
});
check("updateTask: нет задачи", () => {
    assert.equal(updateTask(demoTasks, 999, "X", "low").ok, false);
});
check("updateTask: некорректный id", () => {
    assert.equal(updateTask(demoTasks, "4", "X", "low").ok, false);
});
check("updateTask: пустое имя", () => {
    assert.equal(updateTask(demoTasks, 4, "   ", "low").ok, false);
});
check("updateTask: неизвестный приоритет", () => {
    assert.equal(updateTask(demoTasks, 4, "X", "urgent").ok, false);
});
check("updateTask: входной массив не изменён", () => {
    const before = JSON.stringify(demoTasks);
    updateTask(demoTasks, 4, "Изменено", "high");
    assert.equal(JSON.stringify(demoTasks), before);
});