import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckRecordsSchema {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:d:/PythonProject/mycount/backend/mycount.db";
        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Checking columns for 'accounting_records'...");
            ResultSet rs = stmt.executeQuery("PRAGMA table_info(accounting_records)");
            while (rs.next()) {
                System.out.println("Column: " + rs.getString("name") + " (" + rs.getString("type") + ")");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
