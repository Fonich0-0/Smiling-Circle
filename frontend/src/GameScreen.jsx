import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // Импортируем кое какие экзотические хуки 0_0
import './css/style.css' // Стили
// Тут импортируются фоточки :3
import heroImagePath from './assets/img/Smile2.png'


function GameScreen() {
    // 1. Получает levelPath из роутера (какой уровень грузить)
    // 2. useEffect - вся игровая логика здесь
    // 3. Возвращает JSX

    // Хук react-router, даёт доступ к данным, переданным при переходе на страницу 
    // (navigate('/game-screen', {state: { levelPath: path }} )) в LevelsMenu.jsx).
    const location = useLocation();

    // Справшиваем у location состание state (?) с ключом levelPath
    const levelPath = location.state?.levelPath;

    // import.meta.glob(...) — это фишка Vite (сборщика), а не React. 
    // Она на этапе сборки находит все файлы по маске ./json-data/*/*.json 
    // и импортирует их сразу (eager: true). В итоге levelFiles — это объект вида 
    // { './json-data/biome-?/stage-?.json': {...данные}, ... }.
    const levelFiles = import.meta.glob('./json-data/*/*.json', { eager: true });

    // Хук useNavigate нужен для перенаправления по .jsx файлам 
    // Пример - "navigate('/main-menu')" (названия страниц мы ука-
    // зываем в App.jsx, об этом подробнее там)
    const navigate = useNavigate();

    // Хук useRef возвращает изменяемый объект 
    // с одним единственным свойством: { current: ... }
    const canvasRef = useRef(null); // null — начальное значение. Показывает, что прямо сейчас 
                                    // (до того, как компонент отрисуется на экране) ссылка ни 
                                    // на что не указывает.

    // Переменная для хранения истинных и ложных направлений игрока
    const keysRef= useRef({ left: false, right: false, top: false, down: false }); // Для проверок
        const setKey = (keyName, value) => {
        keysRef.current[keyName] = value;
    };

    // Хук useEffect "сообщает" React'у :
    // «Сначала нарисуй компонент на экране, а сразу после этого выполни вот этот код»                                  
    useEffect(() => { 
    // Как устроен:
        // useEffect(() => {
             // 1. Код эффекта (что сделать)
            //}, [ /* 2. Массив зависимостей (когда делать) */ ]);


        // -------------------------------------------------- //
        // Код эффекта
        // Это конструкция для безопасного доступа к Canvas 
        // (так называемый Guard Clause или «защитное условие»).
        const canvas = canvasRef.current; // 1. Вытаскиваем сам DOM-элемент canvas из ссылки
        if (!canvas) return;              // 2. Если элемента там нет — мгновенно выходим и не выполняем код дальше
        // Это нужно чтобы:
        // Код функции useEffect может попытаться выполниться в момент, когда <canvas> ещё 
        // физически не существует в DOM-дереве браузера.

        // Если бы этой строки не было и canvas оказался равным null, то строчка:
        const ctx = canvas.getContext("2d"); // Выбираем тип Canvas'а (2D)
        // вызвала бы критическую ошибку (Uncaught TypeError):


        let animationFrameId; // Нужна, чтобы хранить уникальный номер (ID) анимации.
        // а это нужно нам для того, чтобы остановить анимацию, когда она больше не нужна. (об этом позднее)

        // Проект использует механизм requestAnimationFrame для плавных Canvas-анимаций/
        // Он работает как бесконечный цикл, который рисует 60 кадров в секунду/


        // Слушатели клавиш
        // Когда нажал
        const handleKeyDown = (e) => {
            if (e.code === "ArrowLeft" || e.code === "KeyA") keysRef.current.left = true;   // Если бро нажал кнопку налево
            if (e.code === "ArrowRight" || e.code === "KeyD") keysRef.current.right = true; // Если бро нажал кнопку направо
            if (e.code === "Space") { // Прыжок
                e.preventDefault(); // Чтобы убрать полосы прокрытки при нажатии на пробел, иначе кнопка поднимет сайт вверх
                keysRef.current.top = true;
            };
        };

        // Когда отпустил (по факту тут все также как в handleKeyDown, только наоборот)
        const handleKeyUp = (e) => {
            if (e.code === "ArrowLeft" || e.code === "KeyA") keysRef.current.left = false;
            if (e.code === "ArrowRight" || e.code === "KeyD") keysRef.current.right = false;
            if (e.code === "Space") {
                e.preventDefault(); 
                keysRef.current.top = false;
            };
        };

        // Добавляем, чтобы сайт проверял какие кнопочки мы тыкаем .-.
        window.addEventListener("keydown", handleKeyDown); // Те что мы нажимаем 
        window.addEventListener("keyup", handleKeyUp); // Те что отпустили
        // (кстати handleKeyDown и handleKeyUp - эти херни выше этих двух строчек кода :)

        // ФУНКЦИИ ПРОВЕРКИ КОЛЛИЗИЙ (чтобы игрок не улетел за этот прекрасный мир) *-*

        // Проверка AABB коллизий

        // На пальцах я не объясню эти формулы, я оставил ссылки на ресурсы:

        function checkAABBCollision(rectA, rectB) { // Про это можно почитать тут -> https://www.learn-to-fly.ru/theory/math-for-game-development/kollizii-aabb-obb-krugovye-i-poligonalnye/
            return (
                rectA.x < rectB.x + rectB.width &&
                rectA.x + rectA.width > rectB.x &&
                rectA.y < rectB.y + rectB.height &&
                rectA.y + rectA.height > rectB.y
            );
        }

        function isGrounded(player, block) { // Тута мы проверяем что наш круглый чебупеля (игрок) НА ЗЕМЛЕ
             return (
                player.x + player.width > block.x && 
                player.x < block.x + block.width &&
                player.y + player.height >= block.y && 
                player.y + player.height <= block.y + 10 // небольшая погрешность для падения
            ); 
        }

        // Запуск логики игры
        async function start() { // В общем, эта функция будет использована ниже, перед return
            // Эта функция предназначена для запуска игры, тут будет вся логика, весь основной код
            // движка, перед этой функцией мы объявляли что-то статическое, именно тут будет кста
            // GameLoop()  >_<

            const currentPath = levelPath || 'biome-1/stage-1.json';

            // Представьте, что у вас в переменной levelPath лежит путь к файлу уровня:
            // "json-data/biome-1/stage-2.json", я добавил эту строку и...
            const cleanPath = currentPath.replace(/^(\.\/)?(json-data\/)?/, '').replace(/\.json$/, '');
            // ...после выполнения этой строки в cleanPath останется только:
            //"biome-1/stage-2"

            // Разбор RegEx (регулярного выражения):
            // Первая часть: ".replace(/^json-data\//, '')" - Удаляет "json-data/" в самом начале пути.
            // Вторая часть: ".replace(/\.json$/, '')" - Удаляет расширение .json в самом конце пути.
            // Официальная документация RegEx находиться тут -> https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Regular_expressions

            // Но зачем? Ответ прост:
            // Помните, чуть выше у вас был импорт Vite:
            // import.meta.glob('./json-data/*/*.json', { eager: true });

            // Так вот:
            // Vite отдает ключи файлов с папками и расширениями (например, ./json-data/level1.json).
            // Но в игре, удобнее обращаться к уровням по коротким понятным именам 
            // (например, biome-1/stage-2), 
            // чтобы показывать их в UI или загружать нужный конфиг без мусора в названии.


            // А вот теперь мы ищем файл среди тех, что собрал Vite *-*
            // т.е. эти две строки берут это чистое имя и находят реальные 
            // данные этого уровня внутри огромного объекта, который собрал Vite. 
            const foundKey = Object.keys(levelFiles).find(key => key.includes(cleanPath));
            // Object.keysRef.current(levelFiles) — превращает объект с файлами в обычный список (массив) путей к файлам.

            // Было: { './json-data/biome-1/stage-2.json': { ...данные... } }
            // Стало: ['./json-data/biome-1/stage-2.json', ...]

            // .find(...) — ищет в этом списке первый попавшийся элемент, который подходить под условие.

            // key.includes(cleanPath) — проверяет: 
            // «Содержит ли длинный путь файла внутри себя нашу чистую строчку "biome-1/stage-2"?».

            // foundKey — результат поиска. В переменную запишется точный полный ключ, 
            // например: './json-data/biome-1/stage-2.json'.
            
            const levelModule = levelFiles[foundKey];
            // Здесь всё просто — вы обращаетесь к объекту levelFiles по найденному 
            // ключу foundKey и достаете оттуда само содержимое JSON-файла (карту 
            // уровня, координаты спавна игрока, врагов, блоки и т.д.).

            // Теперь в переменной levelModule лежат все настройки вашего уровня, 
            // с которыми уже можно работать и отрисовывать их на Canvas! :)


            // ЕСЛИ ФАЙЛ НЕ НАЙДЕН — НЕ ПАДАЕМ НА КОЛЕНИ ПЕРЕД БЛЕВОТИНОЙ ИНТЕПРЕТАТОРА, 
            // А ПИШЕМ В КОНСОЛЬ! :]
            if (!levelModule) {
                console.log("🟥 (Error) Не могу найти уровень!");
                console.log("Пришло из levelPath: ", levelPath);
                console.log("Очищенный путь (cleanPath):", cleanPath);
                console.log("Доступные ключи в Vite:", Object.keysRef.current(levelFiles));
                return; // Останавливаем выполнение, чтобы НЕ БЫЛО ошибки undefined
            }

            // Если всё нашли — берем данные 0_0
            const levelData = levelModule.default || levelModule;
            console.log("🟩 (Success) Успешно загрузили данные уровня:", levelData);


            // Ну вот теперь мы можем приняться за построение этого прекрасного мира 0_0

            // Достаем объекты из JSON (с фолбеками на пустые массивы)
            const objectsBackList = levelData.objects_back || [];      // Задние объекты (ну типо фон, далекие объекты и тд)
            const objectsMiddleList = levelData.objects_middle || [];  // Объекты перед игроком
            const objectFrontList = levelData.objects_front || [];     // Объекты ближе к "камере" (передние)
            const springsList = levelData.springs || [];               // Вот тут пружины, чтобы прыгать высоко
            const spikesList = levelData.spikes || [];                 // Шипы, чтобы жизнь малиной не казалась (ХАПЗХАПЗАПХАП)
            // На минуточку, в этих переменных будут находиться КООРДИНАТЫ, где они будут в игре (ну типо X, Y...)

            // Данные можно посмотреть в папка рядом с данным файлом (на том же уровне)
            // json-data/biome-?/stage-?.json <- вот тут корчое


            // Загружаем все особо важные текстуры
            const heroImage = new Image(); // new Image() чтобы объявить что это будет фото
            heroImage.src = heroImagePath; // А тут даем ему ссылку КОТОРУЮ МЫ ИМПОРТИРОВАЛИ В САМОМ ВЕРХУ
            // Там ещё будет написано "Тут импортируются фоточки :3"

            // Класс Игрока
            class Player {
                constructor(name) {
                    this.name = name;       // Имя
                    this.hp = 100           // Жизни
                    this.time = 1           // Время (фора)
                    this.x = 100;           // Положение по X
                    this.y = 250;           // Положение по Y
                    this.oldX = this.x;     // Старое положение по X
                    this.oldY = this.y;     // Старое положение по Y

                    this.vx = 0;            // Скорость по X
                    this.vy = 0;            // Скорость по Y
                    this.gravity = 0.5;     // Гравитация (УСП)
                    this.bounceForce = -15; // Большой прыжок от пружины 

                    this.width = 45;        // Ширина игрока (персонажа)
                    this.height = 65;       // Длина игрока (персонажа)
                    this.speed = 5;         // Скорость игрока
                    this.jump = -10          // Прыжок игрока (МИНУС ПОТОМУ ЧТО ПРИ УМЕНЬШЕНИИ Y МЫ СТРЕМИМСЯ ВВЕРХ)
                    this.isGrounded = false; // Стоит ли на земле (false - нет)
                }

                // Функция для обновления (повторяется каждый кадр в GameLoop) ?_?
                update() {
                    this.oldX = this.x; // Старыйм X
                    this.oldY = this.y; // Старый Y
                    // Старое положение по X и Y нужно что бы если 
                    // Нынешние X и Y попадут в текстуру, можно было 
                    // Сделать ОТКАТ и вернуться на прошлое положение.

                    // Движение X
                    if (keysRef.current.left) this.x -= this.speed;  // Если ключ.лево = true то: положение_по_X - его скорость 
                    if (keysRef.current.right) this.x += this.speed; // Если ключ.право = true то: положение_по_X + его скорость 
                    // Чем меньше X тем левее, чем больше X тем правее

                    // Коллизия X с объектами среднего плана
                    for (let object of objectsMiddleList) {
                        if (checkAABBCollision(this, object)) {
                            this.x = this.oldX;
                            break;
                        }
                    }

                    // Движение Y (Гравитация)
                    this.vy += this.gravity; // скорость_по_Y увеличивается засчет гравитации (УСП)
                    this.y += this.vy;       // Увеличиваем положение по Y (засчет скорости по Y)
                    // Чем меньше Y тем выше, чем больше Y тем ниже

                    this.isGrounded = false; // Помечаем что игрок НЕ НА ПОВЕРХНОСТИ

// ----------------------------------- ИСПАРВЬ КОД ТУТ -----------------------------------------------------------------
// --------------------------------------------------4-05-4285-482528458245824580924 
                    // for (let i = itemsList.length - 1; i >= 0; i--) {
                    //     let item = itemsList[i];
                    //     if (checkAABBCollision(this, item)) {
                    //         if (item.type === "coin") {
                    //             this.inventory.coins += 1;
                    //         } else if (item.type === "key") {
                    //             this.inventory.keysRef.current += 1;
                    //         } else if (item.type === "weapon") {
                    //             this.inventory.weapons.push(item.name);
                    //         }
                    //         itemsList.splice(i, 1); // убираем предмет с карты — он подобран
                    //     }
                    // }

                    // Коллизия Y с объектами среднего плана
                    for (let object of objectsMiddleList) {
                        if (isGrounded(this, object))
                            this.isGrounded = true;
                        if (checkAABBCollision(this, object)) {
                            this.y = this.oldY;
                            if (this.vy > 0) {
                                this.vy = 0;
                            }
                            else if (this.vy < 0) {
                                this.vy = 0
                            }
                            break;
                        }
                    }

                    for (let object of spikesList) {
                        if (checkAABBCollision(this, object)) {
                            if (this.time < 1) {
                                this.time += 0.30
                            }
                            
                            if (this.time >= 1) {
                                this.y -= 4
                                this.vy -= 4
                                this.isGrounded = false;   // Мы больше не на земле
                                this.hp -= 15
                                this.time -= 1
                            }
                            break;
                        }
                    }
                    if (this.hp <= 0) {
                        console.log("У тебя стало 0hp (жизни)")
                    }


                    // Прыжок делаем ТОЛЬКО если мы на земле и нажата кнопка!
                    if (keysRef.current.top && this.isGrounded) {
                        this.vy = this.jump; // Даем импульс вверх
                        this.isGrounded = false;   // Мы больше не на земле
                    }

                    // Коллизия с пружинами
                    for (let spring of springsList) {
                        if (checkAABBCollision(this, spring)) {
                            this.vy = this.bounceForce;
                        }
                    }
                }

                draw() {
                    ctx.imageSmoothingEnabled = false
                    ctx.drawImage(heroImage, this.x, this.y, this.width, this.height)
                }
            }

            const user = new Player("Чебупеля");

            // Игровой цикл
            function gameLoop() {
                user.update();

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 1. Отрисовка заднего плана
                ctx.fillStyle = "#4a4a4a";
                for (let object of objectsBackList) {
                    ctx.fillRect(object.x, object.y, object.width, object.height);
                }

                // 2. Отрисовка средних блоков (с коллизией)
                ctx.fillStyle = "purple";
                for (let object of objectsMiddleList) {
                    ctx.fillRect(object.x, object.y, object.width, object.height);
                }

                // 3. Отрисовка пружин
                for (let spring of springsList) {
                    ctx.fillStyle = spring.color || "green";
                    ctx.fillRect(spring.x, spring.y, spring.width, spring.height);
                }

                // 4. Отрисовка шипов
                for (let spring of spikesList) {
                    ctx.fillStyle = spring.color || "red";
                    ctx.fillRect(spring.x, spring.y, spring.width, spring.height);
                }

                // 5. Отрисовка игрока
                user.draw();

                // 5. Отрисовка переднего плана (перекрывает игрока)
                ctx.fillStyle = "#2b2b2b";
                for (let object of objectFrontList) {
                    ctx.fillRect(object.x, object.y, object.width, object.height);
                }

                animationFrameId = requestAnimationFrame(gameLoop);
            }

            gameLoop();
        }

        // Запускаем асинхронную инициализацию
        start();

        // Функционал отписки и остановки при размонтировании компонента
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [levelPath]);

    return (
        <div id="main-div">
            <div className="game-canvas-wrapper">
                <canvas 
                    ref={canvasRef}
                    width="800" 
                    height="600"
            />
            <div className="touch-controls">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="touch-btn" onClick={() => navigate('/levels-menu')}>N</button>
                        <button 
                            className="touch-btn"
                            onTouchStart={(e) => {
                                e.preventDefault(); // Предотвращает зум, скролл и задержку клика
                                setKey('left', true);
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                setKey('left', false);
                            }}
                            onMouseDown={() => setKey('left', true)}
                            onMouseUp={() => setKey('left', false)}

                            onTouchCancel={(e) => {
                                e.preventDefault();
                                setKey('left', false);
                            }}
                        >
                            ←
                        </button>

                        <button 
                            className="touch-btn"
                            onTouchStart={(e) => {
                                e.preventDefault(); // Предотвращает зум, скролл и задержку клика
                                setKey('right', true);
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                setKey('right', false);
                            }}
                            onMouseDown={() => setKey('right', true)}
                            onMouseUp={() => setKey('right', false)}

                            onTouchCancel={(e) => {
                                e.preventDefault();
                                setKey('right', false);
                            }}
                        >
                            →
                        </button>
                    </div>
                    
                    <button 
                        className="touch-btn"
                        onTouchStart={(e) => {
                            e.preventDefault(); // Предотвращает зум, скролл и задержку клика
                            setKey('top', true);
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            setKey('top', false);
                        }}
                        onMouseDown={() => setKey('top', true)}
                        onMouseUp={() => setKey('top', false)}

                        onTouchCancel={(e) => {
                            e.preventDefault();
                            setKey('top', false);
                        }}
                        >
                        •
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameScreen;