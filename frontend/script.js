// Главные переменные
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d"); // 2D игра

// Словарь, заданный кнопок с их значением (нажата/не нажата)
const keys = {
    "left": false,
    "right": false,
};

let objectsList = [{x: 0, y: 350, width: 750, height: 50}, {x: 0, y: 0, width: 50, height: 400}, {x: 750, y: 0, width: 50, height: 400},
                    {x: 0, y: 160, width: 660, height: 50}
];

let spring = {
    x: 700,
    y: 330, // Чуть выше пола, чтобы стояла НА нем
    width: 40,
    height: 20,
    color: "cyan" // Цвет морской волны для заметности
};

let inventory = [{id: 0, item: null, count: 0}, {id: 1, item: null, count: 0}, 
                 {id: 2, item: null, count: 0}, {id: 3, item: null, count: 0}]

let id_inventory = 0

const stacking_objects =  ["Патроны",]
// Прогружаем все текстуры в этих переменных
const heroImage = new Image();
const inventoryBlok = new Image()

// 2. Указываем путь к твоему сохраненному PNG
heroImage.src = '/static/game/img/Smile2.png';
inventoryBlok.src = '/static/game/img/Blok.png';

// Характеристики инвенторя
const inventoryXstat = 275
const inventoryYstat = 325
const inventoryWidthStat = 50
const inventoryHeightStat = 50

// Классы
class Player {
    constructor(name) {
        this.name = name;
        
        // Координаты ВЕРХНЕГО ЛЕВОГО угла игрока (для простоты расчетов)
        this.x = 100;
        this.y = 250;

        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.4
        this.bounceForce = -15
        
        this.width = 48;  // Полная ширина (40px)
        this.height = 48; // Полная высота (40px)
        
        this.speed = 5; // Скорость движения
    }

    // Обновление позиции игрока
    update() {
        // Запоминаем старые координаты ПЕРЕД движением.
        // Если мы врежемся в стену, эти координаты спасут нас — мы к ним вернемся.
        this.oldX = this.x;
        this.oldY = this.y;

        // Движение влево/вправо
        if (keys.left) {
            this.x -= this.speed;
        }
        if (keys.right) {
            this.x += this.speed;
        }

        // ПРОВЕРКА СТОЛКНОВЕНИЙ
        // Проверяем игрока по очереди со всеми платформами из массива
        for (let object of objectsList) {
            if (checkAABBCollision(this, object)) {
                // Если сдвиг по X вызвал столкновение — отменяем его (возвращаем старый X)
                this.x = this.oldX;
            }
        }
        
        this.vy += this.gravity; // УСП увеличивает нашу скорость каждый кадр (эффект разгона)
        this.y += this.vy;

        for (let object of objectsList) {
            if (checkAABBCollision(this, object)) {
                // Если движение по Y вызвало столкновение — отменяем его
                this.y = this.oldY;

                if (this.vy > 0) {
                    this.vy = 0
                }
            }
        }

        if (checkAABBCollision(this, spring)) {
                this.vy = this.bounceForce
            }
    }

    // Отрисовка игрока на холсте
    draw() {
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.drawImage(heroImage, this.x, this.y, this.width, this.height);
    }
}

// Функция добавления предмета в инвентарь:
function addItem(ItemName, amount) { // В аргументах у нас Имя объекта и его кол-во
    // Ищём в инвентаре[i] предмет;
    for (let i = 0; i < inventory.length; i++) { 
    // I - Объявляем i = 0; 
    // II - Условие: пока мы не дойдём до конца массива (i должна быть меньше длинны массива); 
    // III - По окончанию прибавляем +1 к i
        if (inventory[i]["item"] in stacking_objects) { // Если предмет в ячейке инвентарь[i][предмет] умеет стакаться, то
            if (inventory[i]["item"] === ItemName) { // Мы проверяем, является ли тот предмет, тем что мы подобрали
                // Если это условие верно, мы проверяем:
                if (inventory[i]["count"] >= 1) { // Если кол-во предмета в  инвентарь[i][кол-во] больше или равно 1, то
                    inventory[i]["count"] += amount // Добавляем +amount ко всеми кол-ву
                    return // Что бы функция заткнулась
                }
                else { // Иначе просто добавляем предмет
                    inventory[i]["item"] = ItemName // Тот что подобрали
                    return // Что бы функция заткнулась
                };
            }
        }
    }
    // Если прошлый цикл пройден и не решил свою задачу:
    for (let i = 0; i < inventory.length; i++) { // Проходим по каждой ячейке и 
        if (!inventory[i]["item"]){ // Проверяем если в ней НИЧЕГО НЕТ, то
            inventory[i]["item"] = ItemName // Добавляем в ячейку предмет и
            inventory[i]["count"] = amount // Его кол-во
            return // Что бы функция заткнулась
        }
    }
} 


// Проверка столкновений (при паралельных прямоугольниках монитору)
function checkAABBCollision(rectA, rectB) {
    return rectA.x < rectB.x + rectB.width &&
        rectA.x + rectA.width > rectB.x &&
        rectA.y < rectB.y + rectB.height &&
        rectA.y + rectA.height > rectB.y;
}; 

// Переменная, создающая объект user по чертежу класса Player
let user = new Player("Чебупеля");

// Игровой цикл (перерисовка по кадрово, объекты)
function gameLoop() {
    // === БЛОК 1: ЛОГИКА И ФИЗИКА (Считаем в уме, на экран пока ничего не выводим) ===
    user.update(); // Двигаем игрока

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст

    ctx.fillStyle = "purple";
    for (let object of objectsList) {
        ctx.fillRect(object.x, object.y, object.width, object.height);
        
    }
    ctx.fillRect(spring.x, spring.y, spring.width, spring.height, spring.color);
    
    // Рисуем игрока
    user.draw();
    requestAnimationFrame(gameLoop); // Зацикливаем
};

heroImage.onload = function() {
    requestAnimationFrame(gameLoop); 
}; 

window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
        keys.left = true
    }
    else if (e.code === "ArrowRight" || e.code === "KeyD") {
        keys.right = true
    }
});

window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
        keys.left = false
    }
    else if (e.code === "ArrowRight" || e.code === "KeyD") {
        keys.right = false
    }
});