package com.mycount.backend.service;

import com.mycount.backend.entity.Admin;
import com.mycount.backend.repository.AdminRepository;
import com.mycount.backend.dto.AppDtos.AdminCreate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@Transactional
public class AdminService {
    private final AdminRepository adminRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepo, PasswordEncoder passwordEncoder) {
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public Admin getAdminByUsername(String username) {
        return adminRepo.findByUsername(username).orElse(null);
    }

    public List<Admin> getAdmins() {
        return adminRepo.findAll();
    }

    public Admin createAdmin(AdminCreate dto) {
        Admin admin = new Admin();
        admin.setUsername(dto.username());
        admin.setHashedPassword(passwordEncoder.encode(dto.password())); 
        admin.setRole(dto.role() != null ? dto.role() : "user");
        
        return adminRepo.save(admin);
    }

    public void deleteAdmin(Integer id) {
        adminRepo.deleteById(id);
    }
}
