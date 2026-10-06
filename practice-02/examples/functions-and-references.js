"use strict";

// ===== Эксперимент 1: sum с числами и строкой =====
function sum(a, b) {
    return a + b;
}
console.log("1.1 sum(2, 3) =", sum(2, 3), "| тип:", typeof sum(2, 3));
console.log('1.2 sum("2", "3") =', sum("2", "3"), "| тип:", typeof sum("2", "3"));

// ===== Эксперимент 2: стрелочная функция без return (ИСПРАВЛЕНО) =====
// Было: const square = (x) => { x * x; };  → возвращала undefined
const square = (x) => {
    return x * x;
};
console.log("2. square(4) =", square(4), "| тип:", typeof square(4));

// ===== Эксперимент 3: объект и ссылка =====
const original = { title: "Черновик", published: false };
const alias = original;
alias.published = true;
console.log("3.1 original.published =", original.published);
console.log("3.2 original === alias:", original === alias);

// ===== Эксперимент 4: spread массива объектов =====
const items = [{ id: 1, done: false }, { id: 2, done: false }];
const copiedItems = [...items];
copiedItems[0].done = true;
console.log("4.1 items[0].done =", items[0].done);         // true — вложенный объект общий
console.log("4.2 copiedItems === items:", copiedItems === items); // false — массив новый

// ===== Эксперимент 5: spread объекта с переопределением =====
const oldBook = { id: 12, title: "Черновик", available: false };
const newBook = { ...oldBook, available: true };
console.log("5.1 oldBook.available =", oldBook.available); // false
console.log("5.2 newBook.available =", newBook.available); // true
console.log("5.3 oldBook === newBook:", oldBook === newBook); // false

// ===== Эксперимент 6: параметр по умолчанию =====
function makeCaption(text = "Без названия") {
    return text;
}
console.log("6.1 makeCaption() =", makeCaption());
console.log("6.2 makeCaption(undefined) =", makeCaption(undefined));
console.log("6.3 makeCaption(null) =", makeCaption(null));
console.log("6.4 makeCaption('') =", JSON.stringify(makeCaption("")));