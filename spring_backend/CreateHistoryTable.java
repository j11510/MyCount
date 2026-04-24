import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class CreateHistoryTable {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:d:/PythonProject/mycount/backend/mycount.db";
        String sql = "CREATE TABLE IF NOT EXISTS accounting_account_history (" +
                     "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                     "bank_account VARCHAR(50), " +
                     "change_amount INTEGER, " +
                     "balance_after INTEGER, " +
                     "reason TEXT, " +
                     "target_date DATE, " +
                     "created_at DATETIME" +
                     ");";
        
        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            System.out.println("Table 'accounting_account_history' created successfully.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
