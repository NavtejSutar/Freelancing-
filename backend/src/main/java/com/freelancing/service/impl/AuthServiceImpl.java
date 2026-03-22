package com.freelancing.service.impl;

import com.freelancing.dto.request.*;
import com.freelancing.dto.response.AuthResponse;
import com.freelancing.dto.response.UserResponse;
import com.freelancing.entity.ClientProfile;
import com.freelancing.entity.FreelancerProfile;
import com.freelancing.entity.RefreshToken;
import com.freelancing.entity.User;
import com.freelancing.entity.enums.UserRole;
import com.freelancing.entity.enums.VerificationStatus;
import com.freelancing.exception.BadRequestException;
import com.freelancing.repository.ClientProfileRepository;
import com.freelancing.repository.FreelancerProfileRepository;
import com.freelancing.repository.RefreshTokenRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.security.JwtTokenProvider;
import com.freelancing.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        if (request.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Cannot register as ADMIN");
        }

        // ── Role-specific validation ──
        if (request.getRole() == UserRole.FREELANCER) {
            if (request.getFirstName() == null || request.getFirstName().isBlank()) {
                throw new BadRequestException("First name is required");
            }
            if (request.getLastName() == null || request.getLastName().isBlank()) {
                throw new BadRequestException("Last name is required");
            }
            String aadhaar = request.getAadhaarNumber();
            if (aadhaar == null || !aadhaar.matches("\\d{12}")) {
                throw new BadRequestException("A valid 12-digit Aadhaar number is required for freelancer registration");
            }
        }

        if (request.getRole() == UserRole.CLIENT) {
            if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
                throw new BadRequestException("Company name is required");
            }
            String gstin = request.getGstinNumber();
            if (gstin == null || !gstin.matches("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")) {
                throw new BadRequestException("A valid 15-character GSTIN is required for client registration");
            }
        }

        // ── Build User ──
        // For clients: store companyName in firstName, "-" in lastName
        // For freelancers: store firstName and lastName normally
        String firstName = request.getRole() == UserRole.CLIENT
                ? request.getCompanyName()
                : request.getFirstName();
        String lastName = request.getRole() == UserRole.CLIENT
                ? "-"
                : request.getLastName();

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(firstName)
                .lastName(lastName)
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .active(false) // inactive until admin verifies
                .build();

        user = userRepository.save(user);

        // ── Create stub profile to store verification data ──
        if (request.getRole() == UserRole.FREELANCER) {
            FreelancerProfile profile = FreelancerProfile.builder()
                    .title("New Freelancer")
                    .aadhaarNumber(request.getAadhaarNumber())
                    .verificationStatus(VerificationStatus.PENDING)
                    .user(user)
                    .build();
            freelancerProfileRepository.save(profile);
        }

        if (request.getRole() == UserRole.CLIENT) {
            ClientProfile profile = ClientProfile.builder()
                    .gstinNumber(request.getGstinNumber())
                    .verificationStatus(VerificationStatus.PENDING)
                    .user(user)
                    .build();
            clientProfileRepository.save(profile);
        }

        CustomUserDetails userDetails = CustomUserDetails.build(user);
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(modelMapper.map(user, UserResponse.class))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.isBanned()) {
            throw new BadRequestException("Your account has been banned");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(modelMapper.map(user, UserResponse.class))
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token expired or revoked");
        }

        User user = refreshToken.getUser();
        CustomUserDetails userDetails = CustomUserDetails.build(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        String newRefreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(modelMapper.map(user, UserResponse.class))
                .build();
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found with this email"));
        // TODO: Send password reset email
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        throw new UnsupportedOperationException("Password reset not yet implemented");
    }

    private String createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
}