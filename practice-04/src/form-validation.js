"use strict";

function isValidPriority(priority) {
    return priority === "low" || priority === "medium" || priority === "high";
}

export function validateTaskDraft(draft, tasks, editingId = null) {
    const errors = {};
    let normalizedId;
    let normalizedTitle;
    let normalizedPriority;

    // === ID ===
    if (editingId !== null) {
        if (typeof editingId !== "number" || !Number.isSafeInteger(editingId) || editingId <= 0) {
            errors.id = "Некорректный идентификатор редактируемой задачи";
        } else if (!tasks.some((task) => task.id === editingId)) {
            errors.id = `Задача с id=${editingId} не найдена`;
        } else {
            normalizedId = editingId;
        }
    } else {
        const raw = draft.id;
        if (raw === "" || raw === null || raw === undefined) {
            errors.id = "Укажите идентификатор";
        } else {
            const num = Number(raw);
            if (!Number.isSafeInteger(num) || num <= 0) {
                errors.id = "id должен быть положительным целым числом";
            } else if (tasks.some((task) => task.id === num)) {
                errors.id = `Задача с id=${num} уже существует`;
            } else {
                normalizedId = num;
            }
        }
    }

    // === TITLE ===
    if (typeof draft.title !== "string") {
        errors.title = "Название должно быть строкой";
    } else {
        const trimmed = draft.title.trim();
        if (trimmed.length === 0) {
            errors.title = "Название не должно быть пустым";
        } else if (trimmed.length > 100) {
            errors.title = "Название не должно превышать 100 символов";
        } else {
            normalizedTitle = trimmed;
        }
    }

    // === PRIORITY ===
    if (!isValidPriority(draft.priority)) {
        errors.priority = 'Приоритет должен быть "low", "medium" или "high"';
    } else {
        normalizedPriority = draft.priority;
    }

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        value: {
            id: normalizedId,
            title: normalizedTitle,
            priority: normalizedPriority,
        },
    };
}