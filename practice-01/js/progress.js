"use strict";

// === ВАРИАНТ 3 (N=27): 9, 9, 3 ===
const totalTasks = 9;
const completedTasks = 9;

// === ПРОВЕРКА ВХОДНЫХ ДАННЫХ ===
const isValidNumber = (value) =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value);

if (!isValidNumber(totalTasks) || !isValidNumber(completedTasks)) {
    console.log("Ошибка: количество задач должно быть целым числом.");
} else if (totalTasks < 0 || totalTasks > 1000) {
    console.log("Ошибка: totalTasks вне диапазона 0…1000.");
} else if (completedTasks < 0 || completedTasks > totalTasks) {
    console.log("Ошибка: выполнено больше, чем существует, или отрицательное значение.");
} else if (totalTasks === 0 && completedTasks === 0) {
    console.log("Задач пока нет.");
} else {
    const remainingTasks = totalTasks - completedTasks;
    const percentage = (completedTasks / totalTasks) * 100;

    let status;
    if (completedTasks === 0) {
        status = "Не начато";
    } else if (completedTasks === totalTasks) {
        status = "Завершено";
    } else {
        status = "В работе";
    }

    console.log(`Всего задач: ${totalTasks}`);
    console.log(`Выполнено: ${completedTasks}`);
    console.log(`Осталось: ${remainingTasks}`);
    console.log(`Прогресс: ${percentage.toFixed(1)}%`);
    console.log(`Статус: ${status}`);
}