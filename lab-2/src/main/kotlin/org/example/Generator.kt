package org.example

import tornadofx.*
import javafx.geometry.Pos
import javafx.scene.control.ProgressBar
import javafx.scene.control.TextArea
import javafx.scene.layout.Priority
import java.io.File
import kotlin.math.round
import kotlin.random.Random

class GeneratorApp : App(MainView::class)

class MainView : View() {
    // Константы
    private val MMAX = 10
    private val NMAX = 10
    private val TMAX = 10
    private val IMAX = 50

    // Переменные для хранения данных
    private var inter = 1
    private var iter = 1

    // Массивы для данных
    private val m = IntArray(IMAX)
    private val n = IntArray(IMAX)
    private val a = Array(TMAX) { Array(MMAX) { DoubleArray(NMAX) } }
    private val c = DoubleArray(NMAX)
    private val dn = DoubleArray(NMAX)
    private val dv = DoubleArray(NMAX)
    private val del = DoubleArray(NMAX)
    private val bn = DoubleArray(MMAX)
    private val bv = DoubleArray(MMAX)
    private val y = DoubleArray(MMAX)
    private val x = DoubleArray(NMAX)
    private val ax = DoubleArray(MMAX)
    private val db = DoubleArray(MMAX)
    private var cx = 0.0

    // UI компоненты
    private val interField = textfield {
        text = "1"
    }
    private val iterField = textfield {
        text = "1"
    }
    private var progressBar: ProgressBar by singleAssign()
    private var logArea: TextArea by singleAssign()

    override val root = borderpane {
        title = "Генератор задач оптимизации"
        
        top = vbox(10) {
            paddingAll = 10.0
            
            form {
                fieldset("Параметры генерации") {
                    field("Число временных интервалов") {
                        add(interField)
                    }
                    field("Число решаемых задач") {
                        add(iterField)
                    }
                }
            }

            button("Начать генерацию") {
                action {
                    startGeneration()
                }
                useMaxWidth = true
            }

            vbox {
                label("Прогресс")
                progressBar = progressbar {
                    progress = 0.0
                    useMaxWidth = true
                }
            }

            button("Очистить лог") {
                action {
                    logArea.clear()
                }
                useMaxWidth = true
            }
        }

        center = scrollpane {
            logArea = textarea {
                isEditable = false
                vgrow = Priority.ALWAYS
            }
        }
    }

    init {
        setWindowSize(800, 600)
    }

    private fun setWindowSize(width: Int, height: Int) {
        currentStage?.width = width.toDouble()
        currentStage?.height = height.toDouble()
    }

    private fun logMessage(message: String) {
        logArea.appendText("$message\n")
        // Прокрутка в конец
        logArea.scrollTop = Double.MAX_VALUE
    }

    private fun rand1(rfrom: Double, rto: Double): Double {
        var d = Random.nextDouble()
        d = rfrom + d * (rto - rfrom)
        val i = round(d * 10)
        return i / 10
    }

    private fun maxX(vals: DoubleArray, size: Int): Double {
        if (size <= 0) return 0.0
        var maxVal = vals[0]
        for (i in 0 until size) {
            if (vals[i] >= maxVal) maxVal = vals[i]
        }
        return maxVal
    }

    private fun minX(vals: DoubleArray, size: Int): Double {
        if (size <= 0) return 0.0
        var minVal = vals[0]
        for (i in 0 until size) {
            if (vals[i] <= minVal) minVal = vals[i]
        }
        return minVal
    }

    private fun startGeneration() {
        try {
            inter = interField.text.toIntOrNull() ?: 1
            iter = iterField.text.toIntOrNull() ?: 1

            if (inter <= 0 || iter <= 0) {
                error("Значения должны быть положительными")
                return
            }

            // Очищаем лог перед началом
            logArea.clear()

            // Настраиваем прогресс-бар
            val totalSteps = inter * iter
            progressBar.progress = 0.0

            // Основной цикл генерации
            runAsync {
                for (l in 1..inter) {
                    logMessage("Временной интервал #$l")

                    for (k in 1..iter) {
                        logMessage("Задача #$k")

                        // Создаем файл для записи результатов
                        val filename = "out_${l}_${k}.txt"
                        val fo = File(filename).bufferedWriter()

                        try {
                            if (l == 1) {
                                // Задаем размерность задачи для первого интервала
                                logMessage("Введите размерность задачи #$k")

                                val nk: Int
                                if (k == 1) {
                                    nk = inputDialog("Ввод размерности", "N=").toInt()
                                    n[k - 1] = nk
                                } else {
                                    n[k - 1] = m[k - 2]
                                    logMessage("N=${n[k - 1]}")
                                    nk = n[k - 1]
                                }

                                val mk = inputDialog("Ввод размерности", "M=").toInt()
                                m[k - 1] = mk

                                fo.write("${n[k - 1]} <==N\n")
                                fo.write("${m[k - 1]} <==M\n")

                                // Проверка на допустимость размерностей
                                if (n[k - 1] > NMAX || m[k - 1] > MMAX) {
                                    logMessage("Too big dimensions!")
                                    error("Слишком большие размерности!")
                                    return@runAsync
                                }
                            }

                            if (k == 1) {
                                // Для первой задачи запрашиваем план X
                                logMessage("Введите план")
                                val xValues = vectorInputDialog("Ввод плана X", "Введите компоненты вектора X:", n[k - 1])
                                for (j in 0 until n[k - 1]) {
                                    x[j] = xValues[j]
                                }
                            }

                            if (k > 1 && l > 1) {
                                // Для последующих задач запрашиваем deltaB
                                logMessage("Введите deltaB")
                                for (i in 0 until m[k - 1]) {
                                    logMessage("Введите dB для задачи #$k")
                                    db[i] = inputDialog("Ввод deltaB", "dB[${i + 1}]=").toDouble()
                                }
                            }

                            // Вычисление DN, DV, DEL
                            for (j in 0 until n[k - 1]) {
                                if (k == 1) {
                                    val minXVal = minX(x, n[k - 1])
                                    val maxXVal = maxX(x, n[k - 1])
                                    val threshold1 = minXVal + 0.35 * (maxXVal - minXVal)
                                    val threshold2 = minXVal + 0.65 * (maxXVal - minXVal)

                                    if (x[j] < threshold1) {
                                        dn[j] = x[j]
                                        dv[j] = maxXVal
                                        del[j] = rand1(
                                            dn[j] + 0.25 * (dv[j] - dn[j]),
                                            dn[j] + 0.45 * (dv[j] - dn[j])
                                        )
                                    } else if (x[j] <= threshold2) {
                                        dn[j] = minXVal
                                        dv[j] = maxXVal
                                        del[j] = (maxXVal - minXVal) / 2
                                    } else {
                                        dn[j] = minXVal
                                        dv[j] = x[j]
                                        del[j] = rand1(
                                            dn[j] + 0.55 * (dv[j] - dn[j]),
                                            dn[j] + 0.75 * (dv[j] - dn[j])
                                        )
                                    }
                                } else {
                                    dn[j] = bn[j]
                                    dv[j] = bv[j]
                                    x[j] = ax[j] + db[j]

                                    val threshold1 = dn[j] + 0.35 * (dv[j] - dn[j])
                                    val threshold2 = dn[j] + 0.65 * (dv[j] - dn[j])

                                    if (x[j] < threshold1) {
                                        del[j] = rand1(
                                            dn[j] + 0.25 * (dv[j] - dn[j]),
                                            dn[j] + 0.45 * (dv[j] - dn[j])
                                        )
                                    } else if (x[j] <= threshold2) {
                                        del[j] = (dn[j] + dv[j]) / 2
                                    } else {
                                        del[j] = rand1(
                                            dn[j] + 0.55 * (dv[j] - dn[j]),
                                            dn[j] + 0.75 * (dv[j] - dn[j])
                                        )
                                    }
                                }
                            }

                            // Ввод или вычисление матрицы A и вектора AX
                            if (l == 1) {
                                logMessage("Введите матрицу A")
                                val matrixA = matrixInputDialog("Ввод матрицы A", m[k - 1], n[k - 1])

                                // Копируем матрицу A в трехмерный массив и вычисляем AX
                                for (i in 0 until m[k - 1]) {
                                    ax[i] = 0.0
                                    for (j in 0 until n[k - 1]) {
                                        a[k - 1][i][j] = matrixA[i][j]
                                        ax[i] += a[k - 1][i][j] * x[j]
                                    }
                                }
                            } else {
                                // Для последующих интервалов вычисляем AX
                                for (i in 0 until m[k - 1]) {
                                    ax[i] = 0.0
                                    for (j in 0 until n[k - 1]) {
                                        ax[i] += a[k - 1][i][j] * x[j]
                                    }
                                }
                            }

                            // Вычисление BN, BV, Y
                            for (i in 0 until m[k - 1]) {
                                val minAxVal = minX(ax, m[k - 1])
                                val maxAxVal = maxX(ax, m[k - 1])
                                val threshold1 = minAxVal + 0.35 * (maxAxVal - minAxVal)
                                val threshold2 = minAxVal + 0.65 * (maxAxVal - minAxVal)

                                if (ax[i] < threshold1) {
                                    bn[i] = ax[i]
                                    bv[i] = maxAxVal
                                    y[i] = rand1(
                                        bn[i] + 0.25 * (bv[i] - bn[i]),
                                        bn[i] + 0.45 * (bv[i] - bn[i])
                                    )
                                } else if (ax[i] <= threshold2) {
                                    bn[i] = minAxVal
                                    bv[i] = maxAxVal
                                    y[i] = (maxAxVal - minAxVal) / 2
                                } else {
                                    bn[i] = minAxVal
                                    bv[i] = ax[i]
                                    y[i] = rand1(
                                        bn[i] + 0.55 * (bv[i] - bn[i]),
                                        bn[i] + 0.75 * (bv[i] - bn[i])
                                    )
                                }
                            }

                            // Вычисление C и CX
                            cx = 0.0
                            for (j in 0 until n[k - 1]) {
                                c[j] = del[j]
                                for (i in 0 until m[k - 1]) {
                                    c[j] += a[k - 1][i][j] * y[i]
                                }
                                cx += c[j] * x[j]
                            }

                            // Запись результатов в файл
                            fo.write("C, CX=${cx.format(6, 2)}\n")
                            fo.write(c.slice(0 until n[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")

                            fo.write("DN\n")
                            fo.write(dn.slice(0 until n[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")

                            fo.write("DV\n")
                            fo.write(dv.slice(0 until n[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")

                            fo.write("BN\n")
                            fo.write(bn.slice(0 until m[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")

                            fo.write("BV\n")
                            fo.write(bv.slice(0 until m[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")

                            fo.write("A\n")
                            for (i in 0 until m[k - 1]) {
                                fo.write(a[k - 1][i].slice(0 until n[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")
                            }

                            fo.write("X\n")
                            fo.write(dv.slice(0 until n[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")

                            fo.write("Xopt\n")
                            fo.write(x.slice(0 until n[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")

                            fo.write("B\n")
                            fo.write(ax.slice(0 until m[k - 1]).joinToString(" ") { it.format(6, 2) } + "\n")

                        } finally {
                            fo.close()
                        }

                        logMessage("Результаты сохранены в файл $filename")

                        // Обновляем прогресс-бар
                        val progress = ((l - 1) * iter + k).toDouble() / totalSteps
                        runLater {
                            progressBar.progress = progress
                        }
                    }
                }
                return@runAsync
            } ui {
                information("Готово", "Генерация завершена успешно!")
            }

        } catch (e: Exception) {
            error("Ошибка", "Произошла ошибка: ${e.message}")
            logMessage("ОШИБКА: ${e.message}")
        }
    }

    private fun inputDialog(title: String, message: String): String {
        var result = ""
        
        dialog(title) {
            vbox(10) {
                paddingAll = 10.0
                alignment = Pos.CENTER
                label(message)
                
                val input = textfield {
                    prefWidth = 100.0
                }
                
                button("OK") {
                    action {
                        result = input.text
                        close()
                    }
                    useMaxWidth = true
                }
            }
        }
        
        return result
    }

    private fun vectorInputDialog(title: String, message: String, size: Int): DoubleArray {
        val result = DoubleArray(size)
        
        dialog(title) {
            vbox(10) {
                paddingAll = 10.0
                label(message)
                
                val inputs = Array(size) { i ->
                    hbox(10) {
                        alignment = Pos.CENTER_LEFT
                        label("X[${i + 1}]:")
                        textfield {
                            prefWidth = 100.0
                        }
                    }
                }
                
                button("OK") {
                    action {
                        for (i in 0 until size) {
                            val textField = inputs[i].lookup("TextField") as javafx.scene.control.TextField
                            result[i] = textField.text.toDoubleOrNull() ?: 0.0
                        }
                        close()
                    }
                    useMaxWidth = true
                }
            }
        }
        
        return result
    }

    private fun matrixInputDialog(title: String, rows: Int, cols: Int): Array<DoubleArray> {
        val result = Array(rows) { DoubleArray(cols) }
        
        dialog(title) {
            vbox(10) {
                paddingAll = 10.0
                
                gridpane {
                    hgap = 10.0
                    vgap = 5.0
                    
                    // Создаем массив для хранения ссылок на текстовые поля
                    val textFields = Array(rows) { Array<javafx.scene.control.TextField?>(cols) { null } }
                    
                    for (i in 0 until rows) {
                        for (j in 0 until cols) {
                            label("A[${i + 1},${j + 1}]:") {
                                gridpaneConstraints {
                                    columnRowIndex(j * 2, i)
                                }
                            }
                            
                            textFields[i][j] = textfield {
                                prefWidth = 60.0
                                gridpaneConstraints {
                                    columnRowIndex(j * 2 + 1, i)
                                }
                            }
                        }
                    }
                    
                    button("OK") {
                        action {
                            for (i in 0 until rows) {
                                for (j in 0 until cols) {
                                    result[i][j] = textFields[i][j]?.text?.toDoubleOrNull() ?: 0.0
                                }
                            }
                            close()
                        }
                        useMaxWidth = true
                        gridpaneConstraints {
                            columnSpan = cols * 2
                            columnRowIndex(0, rows)
                        }
                    }
                }
            }
        }
        
        return result
    }

    private fun Double.format(width: Int, precision: Int): String {
        return String.format("%${width}.${precision}f", this)
    }
}

fun main(args: Array<String>) {
    launch<GeneratorApp>()
} 