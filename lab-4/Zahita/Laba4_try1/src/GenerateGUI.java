import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Random;

public class GenerateGUI extends JFrame {
    static final int MMAX = 10;
    static final int NMAX = 10;
    static final int TMAX = 10;
    static final int IMAX = 50;

    static int[] M = new int[IMAX];
    static int[] N = new int[IMAX];
    static double[][][] A = new double[TMAX][MMAX][NMAX];
    static double[] C = new double[NMAX];
    static double[] DN = new double[NMAX];
    static double[] DV = new double[NMAX];
    static double[] DEL = new double[NMAX];
    static double[] BN = new double[MMAX];
    static double[] BV = new double[MMAX];
    static double[] Y = new double[MMAX];
    static double[] X = new double[NMAX];
    static double[] AX = new double[MMAX];
    static double[] DB = new double[MMAX];
    static double CX;
    static Random random = new Random();

    static double rand1(double rfrom, double rto) {
        double d = random.nextDouble();
        d = rfrom + d * (rto - rfrom);
        return Math.round(d * 10) / 10.0;
    }

    static double maxX(double[] val, int size) {
        double max_val = val[0];
        for (int i = 1; i < size; i++) {
            if (val[i] >= max_val)
                max_val = val[i];
        }
        return max_val;
    }

    static double minX(double[] val, int size) {
        double min_val = val[0];
        for (int i = 1; i < size; i++) {
            if (val[i] <= min_val)
                min_val = val[i];
        }
        return min_val;
    }

    public final JTextField intervalField;
    public final JTextField tasksField;
    public final JTextField dimensionsField;
    public final JButton generateButton;

    public GenerateGUI() {
        setTitle("Генератор данных");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(300, 200);
        setLocationRelativeTo(null);

        JPanel panel = new JPanel();
        panel.setLayout(new GridLayout(4, 2));

        JLabel intervalLabel = new JLabel("Количество временных интервалов:");
        panel.add(intervalLabel);

        intervalField = new JTextField();
        panel.add(intervalField);

        JLabel tasksLabel = new JLabel("Количество решаемых задач:");
        panel.add(tasksLabel);

        tasksField = new JTextField();
        panel.add(tasksField);

        JLabel dimensionsLabel = new JLabel("Размерность задачи (N):");
        panel.add(dimensionsLabel);

        dimensionsField = new JTextField();
        panel.add(dimensionsField);

        generateButton = new JButton("Сгенерировать");
        panel.add(generateButton);

        add(panel);

        generateButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                int inter = Integer.parseInt(intervalField.getText());
                int iter = Integer.parseInt(tasksField.getText());
                int dimensions = Integer.parseInt(dimensionsField.getText());
                generateData(inter, iter, dimensions);
            }
        });
    }

    public void generateData(int inter, int iter, int dimensions) {
        Random random = new Random();
        try {
            for (int l = 1; l <= inter; l++) {
                for (int k = 1; k <= iter; k++) {
                    String filename = "output_" + l + "_" + k + ".txt";
                    PrintWriter foo = new PrintWriter(new FileWriter(filename));
                    if (l == 1) {
                        int n;
                        if (k == 1) {
                            n = Integer.parseInt(JOptionPane.showInputDialog("Введите размерность задачи #" + k + "\nN="));
                        } else {
                            n = M[k - 1];
                        }

                        int m = Integer.parseInt(JOptionPane.showInputDialog("M="));

                        N[k] = n;
                        M[k] = m;

                        foo.write(N[k] + "<==N\n");
                        foo.write(M[k] + "<==M\n");

                        if (N[k] > NMAX || M[k] > MMAX) {
                            JOptionPane.showMessageDialog(this, "Слишком большие размерности!");
                            return;
                        }
                    }

                    for (int j = 1; j <= N[k]; j++) {
                        X[j] = Double.parseDouble(JOptionPane.showInputDialog("Введите план X[" + j + "]="));
                    }

                    for (int j = 0; j < N[k]; j++) {
                        if (X[j] < (minX(X, N[k]) + 0.35 * (maxX(X, N[k]) - minX(X, N[k])))) {
                            DN[j] = X[j];
                            DV[j] = maxX(X, N[k]);
                            DEL[j] = rand1(DN[j] + 0.25 * (DV[j] - DN[j]), DN[j] + 0.45 * (DV[j] - DN[j]));
                        }
                        if ((X[j] >= (minX(X, N[k]) + 0.35 * (maxX(X, N[k]) - minX(X, N[k])))) &&
                                (X[j] <= (minX(X, N[k]) + 0.65 * (maxX(X, N[k]) - minX(X, N[k]))))) {
                            DN[j] = minX(X, N[k]);
                            DV[j] = maxX(X, N[k]);
                            DEL[j] = (maxX(X, N[k]) - minX(X, N[k])) / 2;
                        }
                        if (X[j] > (minX(X, N[k]) + 0.65 * (maxX(X, N[k]) - minX(X, N[k])))) {
                            DN[j] = minX(X, N[k]);
                            DV[j] = X[j];
                            DEL[j] = rand1(DN[j] + 0.55 * (DV[j] - DN[j]), DN[j] + 0.75 * (DV[j] - DN[j]));
                        }
                    }

                    for (int i = 0; i < M[k]; i++) {
                        AX[i] = 0;
                        for (int j = 0; j < N[k]; j++) {
                            A[k][i][j] = Double.parseDouble(JOptionPane.showInputDialog("Введите матрицу A[" + (i + 1) + "," + (j + 1) + "] = "));
                            AX[i] += A[k][i][j] * X[j];
                        }
                    }

                    for (int i = 0; i < M[k]; i++) {
                        AX[i] = 0;
                        for (int j = 0; j < N[k]; j++) {
                            AX[i] += A[k][i][j] * X[j];
                        }
                    }

                    double CX = 0;
                    for (int j = 0; j < N[k]; j++) {
                        C[j] = DEL[j];
                        for (int i = 0; i < M[k]; i++) {
                            C[j] += A[k][i][j] * Y[i];
                        }
                        CX += C[j] * X[j];
                    }

                    foo.printf("C, CX=%6.2f%n", CX);
                    for (int j = 0; j < N[k]; j++) {
                        foo.printf("%6.2f ", C[j]);
                    }
                    foo.println();

                    foo.println("DN");
                    for (int j = 0; j < N[k]; j++) {
                        foo.printf("%6.2f ", DN[j]);
                    }
                    foo.println();

                    foo.println("DV");
                    for (int j = 0; j < N[k]; j++) {
                        foo.printf("%6.2f ", DV[j]);
                    }
                    foo.println();

                    foo.println("BN");
                    for (int i = 0; i < M[k]; i++) {
                        foo.printf("%6.2f ", BN[i]);
                    }
                    foo.println();

                    foo.println("BV");
                    for (int i = 0; i < M[k]; i++) {
                        foo.printf("%6.2f ", BV[i]);
                    }
                    foo.println();

                    foo.println("A");
                    for (int i = 0; i < M[k]; i++) {
                        for (int j = 0; j < N[k]; j++) {
                            foo.printf("%6.2f ", A[k][i][j]);
                        }
                        foo.println();
                    }

                    foo.println("X");
                    for (int j = 0; j < N[k]; j++) {
                        foo.printf("%6.2f ", X[j]);
                    }
                    foo.println();

                    foo.println("Xopt");
                    for (int j = 0; j < N[k]; j++) {
                        foo.printf("%6.2f ", X[j]);
                    }
                    foo.println();

                    foo.println("B");
                    for (int i = 0; i < M[k]; i++) {
                        foo.printf("%6.2f ", AX[i]);
                    }
                    foo.println();


                    foo.close();
                }
            }
            JOptionPane.showMessageDialog(this, "Данные сгенерированы и сохранены в файлы.");
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(this, "Ошибка при сохранении данных.");
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                GenerateGUI gui = new GenerateGUI();
                gui.setVisible(true);
            }
        });
    }
}
