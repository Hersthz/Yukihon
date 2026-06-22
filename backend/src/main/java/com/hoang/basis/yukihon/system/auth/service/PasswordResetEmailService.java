package com.hoang.basis.yukihon.system.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the password-reset link by email when SMTP is configured (env {@code SPRING_MAIL_HOST}),
 * otherwise logs the link (dev fallback). The JavaMailSender bean only exists when spring.mail.host
 * is set, so {@link ObjectProvider} safely resolves to null when mail is not configured.
 */
@Service
@Slf4j
public class PasswordResetEmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.mail.from:no-reply@yukihon.local}")
    private String from;

    public PasswordResetEmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendResetLink(String email, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        JavaMailSender sender = mailSenderProvider.getIfAvailable();

        if (sender == null) {
            log.info("[DEV] SMTP not configured. Password reset link for {}: {}", email, link);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setFrom(from);
            message.setSubject("Yukihon — Đặt lại mật khẩu");
            message.setText("Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản Yukihon.\n\n"
                    + "Nhấp vào liên kết sau để đặt lại (hết hạn sau 15 phút):\n" + link + "\n\n"
                    + "Nếu bạn không yêu cầu, hãy bỏ qua email này.");
            sender.send(message);
            log.info("Sent password reset email to {}", email);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", email, e.getMessage());
        }
    }
}
