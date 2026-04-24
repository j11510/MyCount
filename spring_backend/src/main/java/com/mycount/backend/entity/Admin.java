package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "admins")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Admin {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 50, unique = true)
    private String username;
    
    @Column(name = "hashed_password", length = 255)
    private String hashedPassword;
    
    @Column(length = 20)
    private String role = "user";
}
