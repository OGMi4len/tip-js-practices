"use strict";

const logEl = document.querySelector("#log");
const form = document.querySelector("#exp-form");
const STORAGE_KEY = "tip-js-practice-04:experiment";

function log(msg) {
    logEl.textContent += msg + "\n";
}

// 1. Пустая форма — submit не вызывается
form.addEventListener("submit", (event) => {
    log("=== submit event ===");
    log(`defaultPrevented (до): ${event.defaultPrevented}`);
    event.preventDefault();
    log(`defaultPrevented (после): ${event.defaultPrevented}`);

    const formData = new FormData(form);
    const id = formData.get("id");
    const title = formData.get("title");
    log(`raw id: ${JSON.stringify(id)} | typeof: ${typeof id}`);
    log(`raw title: ${JSON.stringify(title)} | typeof: ${typeof title}`);

    const numId = Number(id);
    log(`Number(id): ${numId} | typeof: ${typeof numId}`);

    if (typeof title !== "string" || title.trim().length === 0) {
        const errEl = document.querySelector('[data-error="title"]');
        if (errEl) errEl.textContent = "Название не должно быть пустым";
        log("Ошибка: пустое название после trim");
        return;
    }

    const normalized = {
        id: numId,
        title: title.trim(),
    };
    log(`нормализовано: ${JSON.stringify(normalized)}`);

    // Сохранение
    const payload = JSON.stringify({ version: 1, tasks: [normalized] });
    log(`JSON: ${payload}`);
    localStorage.setItem(STORAGE_KEY, payload);

    // Чтение
    const raw = localStorage.getItem(STORAGE_KEY);
    log(`getItem typeof: ${typeof raw}`);
    const parsed = JSON.parse(raw);
    log(`parsed: ${JSON.stringify(parsed)}`);
});

// 5. Повреждённый JSON
window.breakJson = () => {
    localStorage.setItem(STORAGE_KEY, "{broken-json");
    log("Записан повреждённый JSON");
    try {
        JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (err) {
        log(`Ошибка JSON.parse: ${err.message}`);
    }
};

log("Эксперименты готовы. Используй form и window.breakJson() из консоли.");