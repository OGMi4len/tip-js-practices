"use strict";

// === ВАРИАНТ 3 (N=27): 9, 9, 3 ===
const totalTasks = 9;
const completedTasks = 9;
const dailyLimit = 3;

// === ПРОВЕРКИ ===
const isValidNumber = (value) =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value);

if (!isValidNumber(totalTasks) || !isValidNumber(completedTasks) ||
    !isValidNumber(dailyLimit)) {
    console.log("Ошибка: все значения должны быть целыми числами.");
} else if (totalTasks < 0 || totalTasks > 1000) {
    console.log("Ошибка: totalTasks вне диапазона 0…1000.");
} else if (completedTasks < 0 || completedTasks > totalTasks) {
    console.log("Ошибка: некорректное число выполненных задач.");
} else if (dailyLimit < 1 || dailyLimit > 1000) {
    console.log("Ошибка: dailyLimit вне диапазона 1…1000.");
} else {
    let remaining = totalTasks - completedTasks;
    console.log(`Осталось задач: ${remaining}`);

    if (remaining === 0) {
        console.log("Все задачи уже выполнены.");
        console.log("Потребуется дней: 0");
    } else {
        let day = 0;
        while (remaining > 0) {
            day += 1;
            const doneToday = Math.min(dailyLimit, remaining);
            remaining -= doneToday;
            console.log(`День ${day}: выполнено ${doneToday}, осталось ${remaining}`);
        }
        console.log(`Потребуется дней: ${day}`);
    }
}