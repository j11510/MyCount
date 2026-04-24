package com.mycount.backend.controller;

import com.mycount.backend.entity.Admin;
import com.mycount.backend.security.JwtTokenProvider;
import com.mycount.backend.service.AdminService;
import com.mycount.backend.dto.AppDtos.AdminCreate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Auth", description = "인증(로그인) 및 관리자 계정 API")
@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AdminService adminService;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, AdminService adminService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.adminService = adminService;
    }

    @Operation(summary = "액세스 토큰 발급 (로그인)", description = "관리자 아이디와 비밀번호를 검증하고 JWT를 반환합니다.")
    @PostMapping(value = "/token", consumes = {"application/x-www-form-urlencoded", "multipart/form-data"})
    public ResponseEntity<?> login(@RequestParam("username") String username, @RequestParam("password") String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            Map<String, String> response = new HashMap<>();
            response.put("access_token", jwt);
            response.put("token_type", "bearer");
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("detail", "Auth failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("detail", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @Operation(summary = "내 정보 조회", description = "현재 로그인된 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<Admin> getCurrentUser(Authentication authentication) {
        Admin admin = adminService.getAdminByUsername(authentication.getName());
        return ResponseEntity.ok(admin);
    }

    @Operation(summary = "모든 관리자 조회", description = "설정된 모든 관리자 목록을 가져옵니다.")
    @GetMapping("/users")
    public ResponseEntity<List<Admin>> getUsers() {
        return ResponseEntity.ok(adminService.getAdmins());
    }

    @Operation(summary = "관리자 계정 생성", description = "새로운 관리자를 등록합니다.")
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminCreate dto) {
        if (adminService.getAdminByUsername(dto.username()) != null) {
            Map<String, String> error = new HashMap<>();
            error.put("detail", "Username already registered");
            return ResponseEntity.badRequest().body(error);
        }
        return ResponseEntity.ok(adminService.createAdmin(dto));
    }

    @Operation(summary = "관리자 계정 삭제", description = "ID를 통해 관리자 계정을 삭제합니다. (본인 계정 삭제 불가)")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId, Authentication authentication) {
        Admin current = adminService.getAdminByUsername(authentication.getName());
        if (current.getId().equals(userId)) {
            Map<String, String> error = new HashMap<>();
            error.put("detail", "Cannot delete your own account");
            return ResponseEntity.badRequest().body(error);
        }
        adminService.deleteAdmin(userId);
        Map<String, String> res = new HashMap<>();
        res.put("status", "deleted");
        return ResponseEntity.ok(res);
    }
}
