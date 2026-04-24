import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckHistory {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:d:/PythonProject/mycount/backend/mycount.db";
        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Checking tables...");
            ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='accounting_account_history'");
            if (rs.next()) {
                System.out.println("Table 'accounting_account_history' EXISTS.");
            } else {
                System.out.println("Table 'accounting_account_history' DOES NOT EXIST.");
            }
            
            System.out.println("Checking columns...");
            rs = stmt.executeQuery("PRAGMA table_info(accounting_account_history)");
            while (rs.next()) {
                System.out.println("Column: " + rs.getString("name") + " (" + rs.getString("type") + ")");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
