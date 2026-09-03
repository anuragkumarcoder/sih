package com.sih.nerlogistics.service;

import com.sih.nerlogistics.domain.relational.Role;
import com.sih.nerlogistics.domain.relational.User;
import com.sih.nerlogistics.dto.AuthRequest;
import com.sih.nerlogistics.dto.AuthResponse;
import com.sih.nerlogistics.dto.RegisterRequest;
import com.sih.nerlogistics.repository.relational.UserRepository;
import com.sih.nerlogistics.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_DRIVER)
                .assignedState(request.getAssignedState())
                .assignedVehicleId(request.getAssignedVehicleId())
                .active(true)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtils.generateToken(saved.getUsername(), saved.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .userId(saved.getId())
                .username(saved.getUsername())
                .fullName(saved.getFullName())
                .role(saved.getRole().name())
                .assignedState(saved.getAssignedState())
                .assignedVehicleId(saved.getAssignedVehicleId())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .assignedState(user.getAssignedState())
                .assignedVehicleId(user.getAssignedVehicleId())
                .build();
    }
}
