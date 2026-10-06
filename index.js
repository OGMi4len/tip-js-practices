// console.log('Программа запущена')
// console.log("Тип document:", typeof document)

// const courseName = "Технологии индустриального программирования";
// let completedCount = 0;
//
// completedCount = completedCount + 1;
//
// console.log(courseName);
// console.log(completedCount);

// const firstValue = 12;
// const secondValue = "12";
//
// console.log(typeof firstValue); //number
// console.log(typeof secondValue); //string

// const firstText = "14";
// const secondText = "6";
//
// console.log(firstText + secondText);
// console.log(Number(firstText) + Number(secondText));

// console.log(12 === "12");               //false
// console.log(12 === Number("12"))  //true

// const availableHours = 3;
// const requiredHours = 5;
// if (availableHours >= requiredHours) {
//     console.log("Времени достачно");
// } else {
//     console.log("Нужно перенести часть работы")
// }

// console.log(Number.isFinite(7));
// console.log(Number.isFinite(NaN));
// console.log(Number.isFinite("7"));
// console.log(Number.isInteger(7));
// console.log(Number.isInteger(7.5));
// console.log(Number.isFinite("7"));

// let totalHours = 0;
//
// for (let day = 1; day <= 3; day += 1){
//     totalHours += 2;
//     console.log(`День ${day}: накоплено ${totalHours} ч.`);
// }

let pagesLeft = 7;

while (pagesLeft > 0){
    pagesLeft -= 1;
}
console.log("Непрочитанных страниц:",pagesLeft);