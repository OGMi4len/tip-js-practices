"use strict";

import { demoTasks, variantTasks, variantNumber } from "./data.js";
import {
    addTask,
    setTaskCompleted,
    renameTask,
    removeTask,
    getTaskStats,
    getPendingTasks,
    getTaskTitles,
    findTaskById,
} from "./task-service.js";

function printStats(label, tasks) {
    const { total, completed, pending, progress } = getTaskStats(tasks);
    console.log(`\n--- ${label} ---`);
    console.log(`Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);
    if (total === 0) {
        console.log("Задач пока нет");
    } else {
        console.log(`Прогресс: ${progress.toFixed(1)}%`);
    }
}

// ================= ОБЩИЙ СЦЕНАРИЙ =================
console.log("========== ОБЩИЙ СЦЕНАРИЙ ==========");

console.log("\nИсходные задачи:");
console.log(demoTasks);
console.log("Названия:", getTaskTitles(demoTasks));
console.log("Невыполненные id:", getPendingTasks(demoTasks).map((t) => t.id));
printStats("Исходный набор", demoTasks);

let currentTasks = demoTasks;

let result = addTask(currentTasks, 20, "Добавить проверку", "high");
if (result.ok) currentTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После добавления id=20", currentTasks);

result = setTaskCompleted(currentTasks, 4, true);
if (result.ok) currentTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После выполнения id=4", currentTasks);

result = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (result.ok) currentTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После переименования id=10", currentTasks);

result = removeTask(currentTasks, 7);
if (result.ok) currentTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После удаления id=7", currentTasks);

console.log("\nИтоговые id:", currentTasks.map((t) => t.id));

// Показать отказ — повторный id=20
console.log("\nОтказ: повторное добавление id=20");
const fail = addTask(currentTasks, 20, "Дубликат", "low");
if (!fail.ok) console.error("Ошибка:", fail.error);

// Проверка сохранности исходного demoTasks
console.log("\ndemoTasks после всех операций (должен быть исходным, 4 задачи):");
console.log(demoTasks.map((t) => t.id));

// ================= ИНДИВИДУАЛЬНЫЙ СЦЕНАРИЙ (Вариант 3) =================
console.log("\n\n========== ВАРИАНТ " + variantNumber + " ==========");
console.log("Тема: Создание сайта-портфолио");
console.log("Исходные задачи варианта:");
console.log(variantTasks);
printStats("Вариант — исходный", variantTasks);

let vTasks = variantTasks;

// 1) добавить id=80 (low)
result = addTask(vTasks, 80, "Опубликовать портфолио на GitHub Pages", "low");
if (result.ok) vTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После добавления id=80", vTasks);

// 2) установить completed=true для id=11
result = setTaskCompleted(vTasks, 11, true);
if (result.ok) vTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После completed id=11", vTasks);

// 3) переименовать id=23
result = renameTask(vTasks, 23, "Собрать и оформить примеры работ");
if (result.ok) vTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После переименования id=23", vTasks);

// 4) удалить id=37
result = removeTask(vTasks, 37);
if (result.ok) vTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После удаления id=37", vTasks);

// 5) повторно добавить id=80 — отказ
console.log("\nОтказ: повторное добавление id=80");
const vFail = addTask(vTasks, 80, "Дубликат", "low");
if (!vFail.ok) console.error("Ошибка:", vFail.error);

console.log("\nИтоговые id варианта:", vTasks.map((t) => t.id));
console.log("\nvariantTasks после операций (должен быть исходным, 6 задач):");
console.log(variantTasks.map((t) => t.id));