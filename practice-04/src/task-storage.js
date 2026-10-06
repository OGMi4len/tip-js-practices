"use strict";

const STORAGE_VERSION = 1;

function isValidId(id) {
    return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function isValidTask(task) {
    if (!task || typeof task !== "object") return false;
    if (!isValidId(task.id)) return false;
    if (typeof task.title !== "string") return false;
    const trimmed = task.title.trim();
    if (trimmed.length < 1 || trimmed.length > 100) return false;
    if (typeof task.completed !== "boolean") return false;
    if (task.priority !== "low" && task.priority !== "medium" && task.priority !== "high") return false;
    return true;
}

export function isValidTaskList(value) {
    if (!Array.isArray(value)) return false;
    const ids = new Set();
    for (const task of value) {
        if (!isValidTask(task)) return false;
        if (ids.has(task.id)) return false;
        ids.add(task.id);
    }
    return true;
}

export function loadTasks(storage, key, fallbackTasks) {
    const fallbackCopy = fallbackTasks.map((t) => ({ ...t }));

    let raw;
    try {
        raw = storage.getItem(key);
    } catch (err) {
        return { ok: false, source: "fallback", tasks: fallbackCopy, error: "Ошибка чтения хранилища" };
    }

    if (raw === null) {
        return { ok: true, source: "initial", tasks: fallbackCopy };
    }

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        return { ok: false, source: "fallback", tasks: fallbackCopy, error: "Повреждённый JSON в хранилище" };
    }

    if (!parsed || typeof parsed !== "object") {
        return { ok: false, source: "fallback", tasks: fallbackCopy, error: "Неверный формат сохранённых данных" };
    }

    if (parsed.version !== STORAGE_VERSION) {
        return { ok: false, source: "fallback", tasks: fallbackCopy, error: "Неизвестная версия сохранённых данных" };
    }

    if (!isValidTaskList(parsed.tasks)) {
        return { ok: false, source: "fallback", tasks: fallbackCopy, error: "Набор задач не соответствует схеме" };
    }

    return {
        ok: true,
        source: "storage",
        tasks: parsed.tasks.map((t) => ({ ...t })),
    };
}

export function saveTasks(storage, key, tasks) {
    if (!isValidTaskList(tasks)) {
        return { ok: false, error: "Нельзя сохранить некорректный список задач" };
    }

    try {
        storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
        return { ok: true };
    } catch (err) {
        return { ok: false, error: "Не удалось сохранить данные" };
    }
}

export function removeSavedTasks(storage, key) {
    try {
        storage.removeItem(key);
        return { ok: true };
    } catch (err) {
        return { ok: false, error: "Не удалось удалить сохранённые данные" };
    }
}