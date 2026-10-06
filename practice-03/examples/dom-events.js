"use strict";

const log = (msg) => console.log(msg);

// 1. Поиск отсутствующих
document.querySelector("#btn-check-missing").addEventListener("click", () => {
    const missing = document.querySelector("#missing-element");
    const buttons = document.querySelectorAll(".nonexistent-class");
    console.log("missing:", missing);
    console.log("buttons length:", buttons.length);
    console.log("buttons:", buttons);
});

// 2. dataset
document.querySelector("#dataset-list").addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    const btn = e.target.closest("button[data-task-id]");
    if (!btn) return;
    const raw = btn.dataset.taskId;
    console.log("dataset.taskId:", raw, "| typeof:", typeof raw);
    const num = Number(raw);
    console.log("Number(dataset.taskId):", num, "| typeof:", typeof num);
});

// 3. Добавление записей
const itemsList = document.querySelector("#items-list");
const initialItems = [];

document.querySelector("#btn-add-item").addEventListener("click", () => {
    const li = document.createElement("li");
    li.textContent = `Запись ${initialItems.length + 1}`;
    initialItems.push(li);
    itemsList.append(li);

    console.log("initialItems.length:", initialItems.length);
    const currentSnapshot = document.querySelectorAll("#items-list li");
    console.log("Новый querySelectorAll:", currentSnapshot.length);
});

// 4. textContent vs innerHTML
document.querySelector("#btn-change-title").addEventListener("click", () => {
    const box = document.querySelector("#title-box");
    box.textContent = '<strong>Проверка</strong> & "кавычки"';
    console.log("textContent установлен. Внутри:", box.children.length, "дочерних элементов");
});

// 5. Распространение события
const captureZone = document.querySelector("#capture-zone");
const outerButton = document.querySelector("#outer-button");
const innerSpan = document.querySelector("#inner-span");
const eventLog = document.querySelector("#event-log");

function writeLog(line) {
    eventLog.textContent += line + "\n";
}

captureZone.addEventListener("click", (e) => {
    writeLog(`[capture] target=${e.target.id || e.target.tagName} current=${e.currentTarget.id} phase=${e.eventPhase}`);
}, true);

outerButton.addEventListener("click", (e) => {
    writeLog(`[button] target=${e.target.id || e.target.tagName} current=${e.currentTarget.id} phase=${e.eventPhase}`);
});

captureZone.addEventListener("click", (e) => {
    writeLog(`[bubble] target=${e.target.id || e.target.tagName} current=${e.currentTarget.id} phase=${e.eventPhase}`);
});