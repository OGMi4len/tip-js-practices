"use strict";

// ===== Внутренние проверки =====

function isValidId(id) {
    return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function normalizeTitle(value) {
    if (typeof value !== "string") {
        return { ok: false, error: "Название должно быть строкой" };
    }
    const title = value.trim();
    if (title.length < 1 || title.length > 100) {
        return { ok: false, error: "Название должно содержать от 1 до 100 символов" };
    }
    return { ok: true, title };
}

function isValidPriority(priority) {
    return priority === "low" || priority === "medium" || priority === "high";
}

// ===== Задание 2: createTask =====

export function createTask(id, title, priority = "medium") {
    if (!isValidId(id)) {
        return { ok: false, error: "id должен быть положительным целым числом" };
    }

    const titleResult = normalizeTitle(title);
    if (!titleResult.ok) {
        return titleResult;
    }

    if (!isValidPriority(priority)) {
        return { ok: false, error: 'Приоритет должен быть "low", "medium" или "high"' };
    }

    return {
        ok: true,
        task: {
            id,
            title: titleResult.title,
            completed: false,
            priority,
        },
    };
}

// ===== Задание 3: чтение и сводка =====

export function findTaskById(tasks, id) {
    return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
    return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
    return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed === true).length;
    const pending = total - completed;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, pending, progress };
}

// ===== Задание 4: изменение данных =====

export function addTask(tasks, id, title, priority = "medium") {
    if (!isValidId(id)) {
        return { ok: false, error: "id должен быть положительным целым числом" };
    }
    if (tasks.some((task) => task.id === id)) {
        return { ok: false, error: `Задача с id=${id} уже существует` };
    }

    const created = createTask(id, title, priority);
    if (!created.ok) {
        return created;
    }

    return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
    if (!isValidId(id)) {
        return { ok: false, error: "id должен быть положительным целым числом" };
    }
    if (typeof completed !== "boolean") {
        return { ok: false, error: "completed должен быть true или false" };
    }
    if (!tasks.some((task) => task.id === id)) {
        return { ok: false, error: `Задача с id=${id} не найдена` };
    }

    const updated = tasks.map((task) =>
        task.id === id ? { ...task, completed } : task
    );
    return { ok: true, tasks: updated };
}

export function renameTask(tasks, id, title) {
    if (!isValidId(id)) {
        return { ok: false, error: "id должен быть положительным целым числом" };
    }

    const titleResult = normalizeTitle(title);
    if (!titleResult.ok) {
        return titleResult;
    }

    if (!tasks.some((task) => task.id === id)) {
        return { ok: false, error: `Задача с id=${id} не найдена` };
    }

    const updated = tasks.map((task) =>
        task.id === id ? { ...task, title: titleResult.title } : task
    );
    return { ok: true, tasks: updated };
}

export function removeTask(tasks, id) {
    if (!isValidId(id)) {
        return { ok: false, error: "id должен быть положительным целым числом" };
    }
    if (!tasks.some((task) => task.id === id)) {
        return { ok: false, error: `Задача с id=${id} не найдена` };
    }

    const filtered = tasks.filter((task) => task.id !== id);
    return { ok: true, tasks: filtered };
}