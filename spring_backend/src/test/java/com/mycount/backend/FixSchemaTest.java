package com.mycount.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@SpringBootTest
public class FixSchemaTest {
    @Autowired
    private DataSource dataSource;

    @Test
    public void fixSchema() throws Exception {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Starting schema fix...");
            
            try {
                stmt.execute("ALTER TABLE accounting_records ADD COLUMN accounting_year INTEGER");
                System.out.println("Added accounting_year to accounting_records");
            } catch (Exception e) {
                System.out.println("accounting_year may already exist: " + e.getMessage());
            }
            
            try {
                stmt.execute("ALTER TABLE accounting_records ADD COLUMN accounting_month INTEGER");
                System.out.println("Added accounting_month to accounting_records");
            } catch (Exception e) {
                System.out.println("accounting_month may already exist: " + e.getMessage());
            }
            
            try {
                stmt.execute("ALTER TABLE accounting_accounts ADD COLUMN initial_balance INTEGER DEFAULT 0");
                System.out.println("Added initial_balance to accounting_accounts");
            } catch (Exception e) {
                System.out.println("initial_balance may already exist: " + e.getMessage());
            }
            
            try {
                stmt.execute("CREATE TABLE IF NOT EXISTS accounting_account_history (" +
                             "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                             "bank_account VARCHAR(50), " +
                             "change_amount INTEGER, " +
                             "balance_after INTEGER, " +
                             "reason TEXT, " +
                             "target_date DATE, " +
                             "created_at DATETIME" +
                             ")");
                System.out.println("Created accounting_account_history table");
            } catch (Exception e) {
                System.err.println("Error creating history table: " + e.getMessage());
            }
            
            System.out.println("Schema fix finished.");
        }
    }
}
