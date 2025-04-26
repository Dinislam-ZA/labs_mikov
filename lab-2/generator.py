import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import numpy as np
import random
import os

class OptimizationGenerator:
    def __init__(self, root):
        self.root = root
        self.root.title("Генератор задач оптимизации")
        self.root.geometry("800x600")
        
        # Константы
        self.MMAX = 10
        self.NMAX = 10
        self.TMAX = 10
        self.IMAX = 50
        
        # Переменные для хранения данных
        self.Inter = tk.IntVar(value=1)  # Число временных интервалов
        self.Iter = tk.IntVar(value=1)   # Число решаемых задач
        
        # Массивы для данных
        self.M = np.zeros(self.IMAX, dtype=int)
        self.N = np.zeros(self.IMAX, dtype=int)
        self.A = np.zeros((self.TMAX, self.MMAX, self.NMAX), dtype=float)
        self.C = np.zeros(self.NMAX, dtype=float)
        self.DN = np.zeros(self.NMAX, dtype=float)
        self.DV = np.zeros(self.NMAX, dtype=float)
        self.DEL = np.zeros(self.NMAX, dtype=float)
        self.BN = np.zeros(self.MMAX, dtype=float)
        self.BV = np.zeros(self.MMAX, dtype=float)
        self.Y = np.zeros(self.MMAX, dtype=float)
        self.X = np.zeros(self.NMAX, dtype=float)
        self.AX = np.zeros(self.MMAX, dtype=float)
        self.DB = np.zeros(self.MMAX, dtype=float)
        self.CX = 0.0
        
        # Создание основного интерфейса
        self.create_widgets()
        
        # Текстовое поле для вывода информации
        self.log_area = scrolledtext.ScrolledText(self.root, width=70, height=15)
        self.log_area.grid(row=4, column=0, columnspan=2, padx=10, pady=10, sticky="nsew")
        
        # Настройка растяжения элементов
        self.root.grid_rowconfigure(4, weight=1)
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_columnconfigure(1, weight=1)
        
    def create_widgets(self):
        # Фрейм для ввода параметров
        param_frame = ttk.LabelFrame(self.root, text="Параметры генерации")
        param_frame.grid(row=0, column=0, columnspan=2, padx=10, pady=10, sticky="nsew")
        
        # Ввод числа временных интервалов
        ttk.Label(param_frame, text="Число временных интервалов:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        ttk.Entry(param_frame, textvariable=self.Inter, width=10).grid(row=0, column=1, padx=5, pady=5)
        
        # Ввод числа решаемых задач
        ttk.Label(param_frame, text="Число решаемых задач:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        ttk.Entry(param_frame, textvariable=self.Iter, width=10).grid(row=1, column=1, padx=5, pady=5)
        
        # Кнопка запуска генерации
        ttk.Button(self.root, text="Начать генерацию", command=self.start_generation).grid(
            row=1, column=0, columnspan=2, padx=10, pady=10)
        
        # Фрейм для прогресса
        progress_frame = ttk.LabelFrame(self.root, text="Прогресс")
        progress_frame.grid(row=2, column=0, columnspan=2, padx=10, pady=5, sticky="nsew")
        
        # Индикатор прогресса
        self.progress = ttk.Progressbar(progress_frame, orient="horizontal", length=300, mode="determinate")
        self.progress.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        progress_frame.grid_columnconfigure(0, weight=1)
        
        # Кнопка очистки лога
        ttk.Button(self.root, text="Очистить лог", command=self.clear_log).grid(
            row=3, column=0, columnspan=2, padx=10, pady=5)
    
    def log_message(self, message):
        """Добавляет сообщение в лог с прокруткой в конец"""
        self.log_area.insert(tk.END, message + "\n")
        self.log_area.see(tk.END)
        self.root.update_idletasks()  # Обновляем UI
    
    def clear_log(self):
        """Очищает текстовое поле лога"""
        self.log_area.delete(1.0, tk.END)
    
    def rand1(self, rfrom, rto):
        """Аналог функции Rand1 из Pascal-программы"""
        d = random.random()
        d = rfrom + d * (rto - rfrom)
        i = round(d * 10)
        return i / 10
    
    def max_x(self, val, size):
        """Аналог функции MaxX из Pascal-программы"""
        if size > 0:
            return max(val[:size])
        return 0
    
    def min_x(self, val, size):
        """Аналог функции MinX из Pascal-программы"""
        if size > 0:
            return min(val[:size])
        return 0
    
    def input_dialog(self, title, message):
        """Создает диалоговое окно для ввода значения"""
        dialog = tk.Toplevel(self.root)
        dialog.title(title)
        dialog.geometry("300x150")
        dialog.transient(self.root)
        dialog.grab_set()
        
        ttk.Label(dialog, text=message).pack(padx=10, pady=10)
        
        entry_var = tk.DoubleVar()
        entry = ttk.Entry(dialog, textvariable=entry_var)
        entry.pack(padx=10, pady=5)
        entry.focus_set()
        
        result = [None]  # Используем список для передачи результата
        
        def on_ok():
            result[0] = entry_var.get()
            dialog.destroy()
        
        ttk.Button(dialog, text="OK", command=on_ok).pack(padx=10, pady=10)
        
        # Ждем, пока окно закроется
        self.root.wait_window(dialog)
        return result[0]
    
    def matrix_input_dialog(self, title, rows, cols):
        """Создает диалоговое окно для ввода матрицы"""
        dialog = tk.Toplevel(self.root)
        dialog.title(title)
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Создаем фрейм для ввода значений матрицы
        frame = ttk.Frame(dialog)
        frame.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        
        # Создаем поля ввода для каждого элемента матрицы
        entries = []
        for i in range(rows):
            row_entries = []
            for j in range(cols):
                var = tk.DoubleVar()
                ttk.Label(frame, text=f"A[{i+1},{j+1}]:").grid(row=i, column=j*2, padx=5, pady=2)
                entry = ttk.Entry(frame, textvariable=var, width=8)
                entry.grid(row=i, column=j*2+1, padx=5, pady=2)
                row_entries.append(var)
            entries.append(row_entries)
        
        result = [None]  # Используем список для передачи результата
        
        def on_ok():
            # Преобразуем введенные значения в матрицу
            matrix = np.zeros((rows, cols))
            for i in range(rows):
                for j in range(cols):
                    matrix[i, j] = entries[i][j].get()
            result[0] = matrix
            dialog.destroy()
        
        ttk.Button(dialog, text="OK", command=on_ok).pack(padx=10, pady=10)
        
        # Ждем, пока окно закроется
        self.root.wait_window(dialog)
        return result[0]
    
    def vector_input_dialog(self, title, message, size):
        """Создает диалоговое окно для ввода вектора"""
        dialog = tk.Toplevel(self.root)
        dialog.title(title)
        dialog.transient(self.root)
        dialog.grab_set()
        
        ttk.Label(dialog, text=message).pack(padx=10, pady=10)
        
        # Создаем фрейм для ввода значений вектора
        frame = ttk.Frame(dialog)
        frame.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        
        # Создаем поля ввода для каждого элемента вектора
        entries = []
        for i in range(size):
            var = tk.DoubleVar()
            ttk.Label(frame, text=f"X[{i+1}]:").grid(row=i, column=0, padx=5, pady=2)
            entry = ttk.Entry(frame, textvariable=var, width=10)
            entry.grid(row=i, column=1, padx=5, pady=2)
            entries.append(var)
        
        result = [None]  # Используем список для передачи результата
        
        def on_ok():
            # Преобразуем введенные значения в вектор
            vector = np.zeros(size)
            for i in range(size):
                vector[i] = entries[i].get()
            result[0] = vector
            dialog.destroy()
        
        ttk.Button(dialog, text="OK", command=on_ok).pack(padx=10, pady=10)
        
        # Ждем, пока окно закроется
        self.root.wait_window(dialog)
        return result[0]
    
    def start_generation(self):
        """Основной метод для генерации задач, аналог основной программы Pascal"""
        try:
            inter = self.Inter.get()
            iter_count = self.Iter.get()
            
            if inter <= 0 or iter_count <= 0:
                messagebox.showerror("Ошибка", "Значения должны быть положительными")
                return
            
            # Очищаем лог перед началом
            self.clear_log()
            
            # Настраиваем прогресс-бар
            total_steps = inter * iter_count
            self.progress["maximum"] = total_steps
            self.progress["value"] = 0
            
            # Основной цикл генерации (аналог вложенных циклов в Pascal)
            for l in range(1, inter + 1):
                self.log_message(f"Временной интервал #{l}")
                
                for k in range(1, iter_count + 1):
                    self.log_message(f"Задача #{k}")
                    
                    # Создаем файл для записи результатов
                    filename = f"out_{l}_{k}.txt"
                    with open(filename, "w") as fo:
                        if l == 1:
                            # Задаем размерность задачи для первого интервала
                            self.log_message(f"Введите размерность задачи #{k}")
                            
                            if k == 1:
                                n_k = int(self.input_dialog("Ввод размерности", "N="))
                                self.N[k-1] = n_k
                            else:
                                self.N[k-1] = self.M[k-2]
                                self.log_message(f"N={self.N[k-1]}")
                            
                            m_k = int(self.input_dialog("Ввод размерности", "M="))
                            self.M[k-1] = m_k
                            
                            fo.write(f"{self.N[k-1]:2}<==N\n")
                            fo.write(f"{self.M[k-1]:2}<==M\n")
                            
                            # Проверка на допустимость размерностей
                            if self.N[k-1] > self.NMAX or self.M[k-1] > self.MMAX:
                                self.log_message("Too big dimensions!")
                                messagebox.showerror("Ошибка", "Слишком большие размерности!")
                                return
                        
                        if k == 1:
                            # Для первой задачи запрашиваем план X
                            self.log_message("Введите план")
                            self.X[:self.N[k-1]] = self.vector_input_dialog(
                                "Ввод плана X", "Введите компоненты вектора X:", self.N[k-1])
                        
                        if k > 1 and l > 1:
                            # Для последующих задач запрашиваем deltaB
                            self.log_message("Введите deltaB")
                            for i in range(self.M[k-1]):
                                self.log_message(f"Введите dB для задачи #{k}")
                                self.DB[i] = self.input_dialog("Ввод deltaB", f"dB[{i+1}]=")
                        
                        # Вычисление DN, DV, DEL
                        for j in range(self.N[k-1]):
                            if k == 1:
                                min_x_val = self.min_x(self.X[:self.N[k-1]], self.N[k-1])
                                max_x_val = self.max_x(self.X[:self.N[k-1]], self.N[k-1])
                                threshold1 = min_x_val + 0.35 * (max_x_val - min_x_val)
                                threshold2 = min_x_val + 0.65 * (max_x_val - min_x_val)
                                
                                if self.X[j] < threshold1:
                                    self.DN[j] = self.X[j]
                                    self.DV[j] = max_x_val
                                    self.DEL[j] = self.rand1(
                                        self.DN[j] + 0.25 * (self.DV[j] - self.DN[j]),
                                        self.DN[j] + 0.45 * (self.DV[j] - self.DN[j])
                                    )
                                elif self.X[j] <= threshold2:
                                    self.DN[j] = min_x_val
                                    self.DV[j] = max_x_val
                                    self.DEL[j] = (max_x_val - min_x_val) / 2
                                else:
                                    self.DN[j] = min_x_val
                                    self.DV[j] = self.X[j]
                                    self.DEL[j] = self.rand1(
                                        self.DN[j] + 0.55 * (self.DV[j] - self.DN[j]),
                                        self.DN[j] + 0.75 * (self.DV[j] - self.DN[j])
                                    )
                            else:
                                self.DN[j] = self.BN[j]
                                self.DV[j] = self.BV[j]
                                self.X[j] = self.AX[j] + self.DB[j]
                                
                                threshold1 = self.DN[j] + 0.35 * (self.DV[j] - self.DN[j])
                                threshold2 = self.DN[j] + 0.65 * (self.DV[j] - self.DN[j])
                                
                                if self.X[j] < threshold1:
                                    self.DEL[j] = self.rand1(
                                        self.DN[j] + 0.25 * (self.DV[j] - self.DN[j]),
                                        self.DN[j] + 0.45 * (self.DV[j] - self.DN[j])
                                    )
                                elif self.X[j] <= threshold2:
                                    self.DEL[j] = (self.DN[j] + self.DV[j]) / 2
                                else:
                                    self.DEL[j] = self.rand1(
                                        self.DN[j] + 0.55 * (self.DV[j] - self.DN[j]),
                                        self.DN[j] + 0.75 * (self.DV[j] - self.DN[j])
                                    )
                        
                        # Ввод или вычисление матрицы A и вектора AX
                        if l == 1:
                            self.log_message("Введите матрицу A")
                            matrix_a = self.matrix_input_dialog(
                                "Ввод матрицы A", self.M[k-1], self.N[k-1])
                            
                            # Копируем матрицу A в трехмерный массив и вычисляем AX
                            for i in range(self.M[k-1]):
                                self.AX[i] = 0
                                for j in range(self.N[k-1]):
                                    self.A[k-1, i, j] = matrix_a[i, j]
                                    self.AX[i] += self.A[k-1, i, j] * self.X[j]
                        else:
                            # Для последующих интервалов вычисляем AX
                            for i in range(self.M[k-1]):
                                self.AX[i] = 0
                                for j in range(self.N[k-1]):
                                    self.AX[i] += self.A[k-1, i, j] * self.X[j]
                        
                        # Вычисление BN, BV, Y
                        for i in range(self.M[k-1]):
                            min_ax_val = self.min_x(self.AX[:self.M[k-1]], self.M[k-1])
                            max_ax_val = self.max_x(self.AX[:self.M[k-1]], self.M[k-1])
                            threshold1 = min_ax_val + 0.35 * (max_ax_val - min_ax_val)
                            threshold2 = min_ax_val + 0.65 * (max_ax_val - min_ax_val)
                            
                            if self.AX[i] < threshold1:
                                self.BN[i] = self.AX[i]
                                self.BV[i] = max_ax_val
                                self.Y[i] = self.rand1(
                                    self.BN[i] + 0.25 * (self.BV[i] - self.BN[i]),
                                    self.BN[i] + 0.45 * (self.BV[i] - self.BN[i])
                                )
                            elif self.AX[i] <= threshold2:
                                self.BN[i] = min_ax_val
                                self.BV[i] = max_ax_val
                                self.Y[i] = (max_ax_val - min_ax_val) / 2
                            else:
                                self.BN[i] = min_ax_val
                                self.BV[i] = self.AX[i]
                                self.Y[i] = self.rand1(
                                    self.BN[i] + 0.55 * (self.BV[i] - self.BN[i]),
                                    self.BN[i] + 0.75 * (self.BV[i] - self.BN[i])
                                )
                        
                        # Вычисление C и CX
                        self.CX = 0
                        for j in range(self.N[k-1]):
                            self.C[j] = self.DEL[j]
                            for i in range(self.M[k-1]):
                                self.C[j] += self.A[k-1, i, j] * self.Y[i]
                            self.CX += self.C[j] * self.X[j]
                        
                        # Запись результатов в файл
                        fo.write(f"C, CX={self.CX:6.2f}\n")
                        fo.write(" ".join([f"{self.C[j]:6.2f}" for j in range(self.N[k-1])]) + "\n")
                        
                        fo.write("DN\n")
                        fo.write(" ".join([f"{self.DN[j]:6.2f}" for j in range(self.N[k-1])]) + "\n")
                        
                        fo.write("DV\n")
                        fo.write(" ".join([f"{self.DV[j]:6.2f}" for j in range(self.N[k-1])]) + "\n")
                        
                        fo.write("BN\n")
                        fo.write(" ".join([f"{self.BN[i]:6.2f}" for i in range(self.M[k-1])]) + "\n")
                        
                        fo.write("BV\n")
                        fo.write(" ".join([f"{self.BV[i]:6.2f}" for i in range(self.M[k-1])]) + "\n")
                        
                        fo.write("A\n")
                        for i in range(self.M[k-1]):
                            fo.write(" ".join([f"{self.A[k-1, i, j]:6.2f}" for j in range(self.N[k-1])]) + "\n")
                        
                        fo.write("X\n")
                        fo.write(" ".join([f"{self.DV[j]:6.2f}" for j in range(self.N[k-1])]) + "\n")
                        
                        fo.write("Xopt\n")
                        fo.write(" ".join([f"{self.X[j]:6.2f}" for j in range(self.N[k-1])]) + "\n")
                        
                        fo.write("B\n")
                        fo.write(" ".join([f"{self.AX[i]:6.2f}" for i in range(self.M[k-1])]) + "\n")
                    
                    self.log_message(f"Результаты сохранены в файл {filename}")
                    
                    # Обновляем прогресс-бар
                    self.progress["value"] += 1
                    self.root.update_idletasks()
            
            messagebox.showinfo("Готово", "Генерация завершена успешно!")
            
        except Exception as e:
            messagebox.showerror("Ошибка", f"Произошла ошибка: {str(e)}")
            self.log_message(f"ОШИБКА: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = OptimizationGenerator(root)
    root.mainloop() 