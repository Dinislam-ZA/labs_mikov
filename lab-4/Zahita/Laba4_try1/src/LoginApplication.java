import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class LoginApplication extends JFrame {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private Map<String, String[][]> savedDatasets = new HashMap<>();
    private String currentUserRole = "";

    public LoginApplication() {
        setTitle("Login Application");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(300, 150);
        setLocationRelativeTo(null); // Center the frame on screen

        JPanel panel = new JPanel();
        panel.setLayout(new GridLayout(3, 2));

        JLabel usernameLabel = new JLabel("Username:");
        panel.add(usernameLabel);

        usernameField = new JTextField();
        panel.add(usernameField);

        JLabel passwordLabel = new JLabel("Password:");
        panel.add(passwordLabel);

        passwordField = new JPasswordField();
        panel.add(passwordField);

        JButton loginButton = new JButton("Login");
        loginButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String username = usernameField.getText();
                char[] passwordChars = passwordField.getPassword();
                String password = new String(passwordChars);

                // Check if the username and password match any of the predefined credentials
                if (authenticate(username, password)) {
                    currentUserRole = username;
                    openAdminWindow();
                } else {
                    JOptionPane.showMessageDialog(LoginApplication.this,
                            "Invalid username or password", "Error", JOptionPane.ERROR_MESSAGE);
                }
            }
        });
        panel.add(loginButton);

        JButton exitButton = new JButton("Exit");
        exitButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                System.exit(0);
            }
        });
        panel.add(exitButton);

        add(panel);
        setVisible(true);
    }

    private boolean authenticate(String username, String password) {
        // Your authentication logic here
        return (username.equals("admin") && password.equals("123")) ||
                (username.equals("operator") && password.equals("321")) ||
                (username.startsWith("foreman") && password.equals("456")) ||
                (username.startsWith("foreman") && password.equals("678")) ||
                (username.startsWith("foreman") && password.equals("890"));
    }

    private void openAdminWindow() {
        JFrame adminFrame = new JFrame("Admin Window");
        adminFrame.setSize(600, 400);
        adminFrame.setLocationRelativeTo(null);

        JPanel panel = new JPanel();
        panel.setLayout(new BorderLayout());

        JLabel userLabel = new JLabel("Logged in as: " + currentUserRole);
        panel.add(userLabel, BorderLayout.NORTH);

        JComboBox<String> datasetDropdown = new JComboBox<>(new String[]{"Dataset 1", "Dataset 2", "Dataset 3"});
        panel.add(datasetDropdown, BorderLayout.WEST);

        JLabel datasetLabel = new JLabel("Selected Dataset:");
        panel.add(datasetLabel, BorderLayout.CENTER);

        DefaultTableModel model = new DefaultTableModel(new String[]{"Прод", "Шифр_п", "Шифр_ц", "Шифр_пц",
                "Орган_н_п", "Орган_в_п", "План_пц", "Приб_пц"}, 0);
        JTable table = new JTable(model);
        JScrollPane scrollPane = new JScrollPane(table);
        panel.add(scrollPane, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new GridLayout(1, 4));
        JButton saveButton = new JButton("Save");
        buttonPanel.add(saveButton);
        JButton calculateButton = new JButton("Calculate");
        buttonPanel.add(calculateButton);
        JButton editButton = new JButton("Edit");
        buttonPanel.add(editButton);
        JButton addButton = new JButton("Add");
        buttonPanel.add(addButton);
        panel.add(buttonPanel, BorderLayout.SOUTH);

        if (currentUserRole.equals("operator")) {
            addButton.setEnabled(false);
            calculateButton.setEnabled(false);
        } else if (currentUserRole.startsWith("foreman")) {
            addButton.setEnabled(false);
            editButton.setEnabled(false);
            calculateButton.setEnabled(false);
            table.setEnabled(false);
        }

        calculateButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Создание экземпляра класса GenerateGUI
                GenerateGUI generateGUI = new GenerateGUI();
                // Отображение окна GenerateGUI
                generateGUI.setVisible(true);
            }
        });

        saveButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Save the dataset to the Map
                saveDataset(model, datasetDropdown.getSelectedItem().toString());
                JOptionPane.showMessageDialog(adminFrame, "Dataset saved successfully.");
            }
        });

        editButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Open edit window
                openEditWindow(datasetDropdown.getSelectedItem().toString(), datasetDropdown);
            }
        });

        addButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Open add window
                openAddWindow(adminFrame, datasetDropdown);
            }
        });

        datasetDropdown.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String selectedDataset = (String) datasetDropdown.getSelectedItem();
                datasetLabel.setText("Selected Dataset: " + selectedDataset);

                // Load dataset from savedDatasets if exists
                if (savedDatasets.containsKey(selectedDataset)) {
                    String[][] dataset = savedDatasets.get(selectedDataset);
                    model.setRowCount(0);
                    for (String[] row : dataset) {
                        model.addRow(row);
                    }
                } else {
                    adminFrame.setTitle("Admin Window");
                    // Populate table with random data
                    Random random = new Random();
                    model.setRowCount(0);
                    for (int i = 0; i < 10; i++) {
                        model.addRow(new Object[]{
                                "D" + (i + 1),
                                "i" + (random.nextInt(26)),
                                "j" + (random.nextInt(26)),
                                "c" + (random.nextInt(26)),
                                Character.toString((char) (random.nextInt(26) + 'a')),
                                Character.toString((char) (random.nextInt(26) + 'a')),
                                random.nextInt(100),
                                random.nextInt(100)
                        });
                    }
                }
            }
        });

        adminFrame.add(panel);
        adminFrame.setVisible(true);
    }

    private void saveDataset(DefaultTableModel model, String datasetName) {
        int rowCount = model.getRowCount();
        int columnCount = model.getColumnCount();
        String[][] dataset = new String[rowCount][columnCount];
        for (int i = 0; i < rowCount; i++) {
            for (int j = 0; j < columnCount; j++) {
                dataset[i][j] = String.valueOf(model.getValueAt(i, j));
            }
        }
        savedDatasets.put(datasetName, dataset);
    }

    private void openEditWindow(String selectedDataset, JComboBox<String> datasetDropdown) {
        JFrame editFrame = new JFrame("Edit Dataset");
        editFrame.setSize(300, 200);
        editFrame.setLocationRelativeTo(null);

        JPanel panel = new JPanel();
        panel.setLayout(new GridLayout(5, 2));

        JLabel datasetLabel = new JLabel("Select Dataset:");
        panel.add(datasetLabel);

        JComboBox<String> datasetDropdownEdit = new JComboBox<>(new String[]{"Dataset 1", "Dataset 2", "Dataset 3"});
        datasetDropdownEdit.setSelectedItem(selectedDataset);
        panel.add(datasetDropdownEdit);

        JLabel nameLabel = new JLabel("New Dataset Name:");
        panel.add(nameLabel);

        JTextField nameField = new JTextField(selectedDataset); // Pre-fill with current dataset name
        panel.add(nameField);

        JLabel departmentLabel = new JLabel("Department:");
        panel.add(departmentLabel);

        JComboBox<String> departmentDropdown = new JComboBox<>(new String[]{"Department 1", "Department 2", "Department 3"});
        panel.add(departmentDropdown);

        JButton saveButton = new JButton("Save");
        saveButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String newName = nameField.getText();
                String selectedDataset = (String) datasetDropdownEdit.getSelectedItem();
                String[][] dataset = savedDatasets.remove(selectedDataset);
                if (dataset != null) {
                    savedDatasets.put(newName, dataset);
                    datasetDropdown.removeItem(selectedDataset);
                    datasetDropdown.addItem(newName);
                    JOptionPane.showMessageDialog(editFrame, "Dataset renamed to: " + newName);
                } else {
                    JOptionPane.showMessageDialog(editFrame, "Dataset not found: " + selectedDataset);
                }
                editFrame.dispose();
            }
        });
        panel.add(saveButton);

        JButton cancelButton = new JButton("Cancel");
        cancelButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                editFrame.dispose();
            }
        });
        panel.add(cancelButton);

        editFrame.add(panel);
        editFrame.setVisible(true);
    }

    private void openAddWindow(JFrame parentFrame, JComboBox<String> datasetDropdown) {
        JFrame addFrame = new JFrame("Add Dataset");
        addFrame.setSize(300, 200);
        addFrame.setLocationRelativeTo(parentFrame);

        JPanel panel = new JPanel();
        panel.setLayout(new GridLayout(4, 2));

        JLabel rowsLabel = new JLabel("Rows:");
        panel.add(rowsLabel);

        JTextField rowsField = new JTextField();
        panel.add(rowsField);

        JLabel columnsLabel = new JLabel("Columns:");
        panel.add(columnsLabel);

        JTextField columnsField = new JTextField();
        panel.add(columnsField);

        JButton saveButton = new JButton("Save");
        saveButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                int rows = Integer.parseInt(rowsField.getText());
                int columns = Integer.parseInt(columnsField.getText());
                String datasetName = "Dataset " + (savedDatasets.size() + 1);
                String[][] dataset = new String[rows][columns];
                Random random = new Random();
                for (int i = 0; i < rows; i++) {
                    for (int j = 0; j < columns; j++) {
                        dataset[i][j] = Character.toString((char) (random.nextInt(26) + 'a'));
                    }
                }
                savedDatasets.put(datasetName, dataset);
                datasetDropdown.addItem(datasetName);
                JOptionPane.showMessageDialog(addFrame, "Empty dataset added successfully.");
                addFrame.dispose();
            }
        });
        panel.add(saveButton);

        JButton cancelButton = new JButton("Cancel");
        cancelButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                addFrame.dispose();
            }
        });
        panel.add(cancelButton);

        addFrame.add(panel);
        addFrame.setVisible(true);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new LoginApplication();
            }
        });
    }
}
