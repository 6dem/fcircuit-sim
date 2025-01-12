# FCircuit Simulator

FCircuit Simulator — это веб-приложение для моделирования и симуляции СФЭ задежкой.

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
-   **index.js**: Главная точка входа JavaScript, содержит функциональность страницы.

### Директории и их содержимое

#### `src/`

Основная логика приложения.

-   **`classes/`** — Реализация шаблонных классов:

    -   **`circuit.js`**: Родительский класс `Circuit`, который отвечает за моделирование и симуляцию схем.
        #### Методы:
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
    -   **`mig.js`**: Дочерний класс `MIG`, который переопределяет методы:
        -   `parseCircuit(jsonData, circuitNumber)`
        -   `initializeCircuit(setNumber = 0)`
        -   `calculateOutput()`
    -   **`nodes.js`**: Реализация узлов схемы. Содержит три класса:
        -   **`Vertex`** — родительский класс.
        -   **`InputElement`** — дочерний класс: входной элемент схемы.
        -   **`FunctionalElement`** — дочерний класс: функциональный элемент схемы.
            #### Методы:
            -   `getInputValues(circuit)`
            -   `computeFunction(circuit, inputValues)`
    -   **`mig-nodes.js`**: Реализация узлов для MIG, содержит:
        -   **`ZeroElement`** — дочерний класс, наследуется от `Vertex`.
        -   **`MajorityInvertElement`** — дочерний класс, наследуется от `FunctionalElement`. Переопределяет методы:
            -   `getInputValues(circuit)`

-   **`services/`** — Основная программная логика:

    -   **`process-circuits.js`**: Обработка данных, моделирование и симуляция всех схем из входного файла, вычисление выходных значений.

-   **`utils/`** — Вспомогательные функции:
    -   **`format-json.js`**: Форматирование выходного JSON-файла.
    -   **`generate-combinations.js`**: Генерация всех бинарных векторов заданной длины.

#### `styles/`

Стилизация страницы, содержит CSS-файлы для оформления приложения.

#### `tests/`

Директория с юнит-тестами, обеспечивает тестирование функциональности всех модулей.

---
