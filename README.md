# FCircuit Simulator

FCircuit Simulator — это веб-приложение для моделирования, симуляции, визуализации и анимации СФЭ c задержкой.

---

## Быстрый старт

1. Склонируйте репозиторий:
    ```bash
    git clone https://github.com/6dem/fcircuit-sim.git
    cd fcircuit-sim
    ```
2. Установите зависимости:
    ```bash
    npm install
    ```
3. Запустите проект:
    ```bash
    npm start
    ```

Для запуска юнит-тестирования:

```bash
npm test
```

## Структура проекта

### Основные файлы проекта

-   **index.html**: Основная HTML-разметка страницы.
-   **index.css**: Файл, подключающий все стили для приложения.
-   **index.js**: Главная точка входа JavaScript, инициализирует страницу.

### Директории и их содержимое

#### `src/`

Основная логика приложения.

-   **`app/`** — Реализация функциональности веб-приложения:

    -   **`app.js`**: Инициализация приложения.

    -   **`modules/`** — Функциональность интерфейса.

        -   **`fileHandlers.js`**: Модуль работы с файлами.
        -   **`keyvoard-controls.js`**: Модуль обработки горячих клавиш.
        -   **`results.js`**: Модуль интерфейса вычисления выходного значения схем и их метрик.
        -   **`visualization.js`**: Модуль интерфейса визуализации схем.

    -   **`services/`** — Основная функциональные модули приложения.

        -   **`analizator.js`**: Модуль анализа результатов и построения графиков.
        -   **`visualizer.js`**: Модуль визуализации схем.

    -   **`utils/`** — Вспомогательные функции интерфейса.

        -   **`alerts.js`**: Отображение кастомного уведомления.
        -   **`check-uncheck.js`**: Переключатель состояния чекбокса.
        -   **`disable-enable-btn.js`**: Управление активностью кнопки.
        -   **`file-reader-error.js`**: Обработка ошибок при чтении файла.
        -   **`hover-element.js`**: Управление состоянием наведения на элемент.
        -   **`reset.js`**: Функции сброса состояния приложения.
        -   **`show-hide-element.js`**: Отображение/скрытие элементов.

-   **`classes/`** — Реализация шаблонных классов:

    -   **`circuit.js`**: Родительский класс `Circuit`, который отвечает за моделирование и симуляцию схем.
        #### Методы:
        -   `validateCircuit(circuit, circuitNumber)`
        -   `parseCircuit(jsonData, circuitNumber)`
        -   `findAllRoots()`
        -   `dfs(startFE, visited = new Set(), path = [])`
        -   `findAllPaths()`
        -   `calculateDepth(allPaths)`
        -   `buildDepthsDict()`
        -   `buildXDepthsDict()`
        -   `initializeCircuit(setNumber = 0)`
        -   `simulateCircuit(depthsDict)`
        -   `calculateOutput()`
        -   `calculateDelay(stateHistory)`
        -   `searchSignChains(allPaths)`
        -   `calculateSignDelay(signChains)`
    -   **`ig.js`**: Дочерний класс `IG`, наследуется от `Circuit`, переопределяет методы:
        -   `validateCircuit(circuit, circuitNumber)`
        -   `parseCircuit(jsonData, circuitNumber)`
        -   `creatingElements(circuit)`
        -   `calculateOutput()`
    -   **`mig.js`**: Дочерний класс `MIG` наследуется от `IG`, переопределяет методы:
        -   `validateCircuit(circuit, circuitNumber)`
        -   `creatingElements(circuit)`
        -   `initializeCircuit(setNumber = 0)`
    -   **`aig.js`**: Дочерний класс `AIG` наследуется от `IG`, переопределяет методы:
        -   `validateCircuit(circuit, circuitNumber)`
        -   `creatingElements(circuit)`
    -   **`nodes.js`**: Реализация узлов схемы. Содержит три класса:
        -   **`Vertex`** — родительский класс.
        -   **`InputElement`** — дочерний класс: входной элемент схемы.
        -   **`FunctionalElement`** — дочерний класс: функциональный элемент схемы.
            #### Методы:
            -   `getInputValues(circuit)`
            -   `computeFunction(circuit, inputValues)`
    -   **`ig-nodes.js`**: Реализация узлов для MIG, содержит:
        -   **`ZeroElement`** — дочерний класс, наследуется от `Vertex`.
        -   **`InvertElement`** — дочерний класс, наследуется от `FunctionalElement`. Переопределяет методы:
            -   `getInputValues(circuit)`
    -   **`mig-nodes.js`**: Реализация узлов для MIG, содержит:
        -   **`MajorityInvertElement`** — дочерний класс, наследуется от `InvertElement`. Переопределяет поле $mincode = 23$.
    -   **`aig-nodes.js`**: Реализация узлов для MIG, содержит:
        -   **`AndInvertElement`** — дочерний класс, наследуется от `InvertElement`. Переопределяет поле $mincode = 1$.

-   **`services/`** — Основная программная логика:

    -   **`process-circuits.js`**: Обработка данных, моделирование и симуляция всех схем из входного файла, вычисление выходных значений.
    -   **`visual-process-circuit.js`**: Обработка данных, моделирование и симуляция текущей схемы из входного файла, вычисление выходных значений.

-   **`utils/`** — Вспомогательные функции:
    -   **`create-circuit.js`**: Создание экземпляра класса схемы определенного формата.
    -   **`format-json.js`**: Форматирование выходного JSON-файла.
    -   **`generate-combinations.js`**: Генерация всех бинарных векторов заданной длины.
    -   **`stateHistoryNormilize.js`**: Удаление вычисленных элементов с последующих шагов симуляции.
    -   **`to-binary.js`**: Перевод десятичного числа в двоичное заданной длины.

#### `styles/`

Стилизация страницы, содержит CSS-файлы для оформления приложения.

#### `tests/`

Директория с юнит-тестами, обеспечивает тестирование функциональности всех модулей.

---
