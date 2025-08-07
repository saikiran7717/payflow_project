package com.example.payflow_backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendCredentials(String to, String plainPassword) {
        String subject = "Your Temporary Login Credentials";
        String body = "Welcome!\n\nYour temporary password is: " + plainPassword +
                "\nPlease change it after logging in.";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // ✅ 'true' enables HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendPasswordEmail(String toEmail, String username, String password, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setSubject("PayFlow - Password Recovery");
            helper.setFrom("noreply@payflow.com");
            
            String emailBody = buildPasswordEmailBody(username, password, role);
            helper.setText(emailBody);
            
            mailSender.send(message);
            System.out.println("Password email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send password email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildPasswordEmailBody(String username, String password, String role) {
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(username).append(",\n\n");
        body.append("You have requested password recovery for your PayFlow account.\n\n");
        body.append("Role: ").append(role.toUpperCase()).append("\n");
        
        if ("user".equalsIgnoreCase(role)) {
            body.append("For security reasons, User accounts require password reset through HR/Manager.\n");
            body.append("Please contact your HR department or Manager to reset your password.\n\n");
        } else {
            body.append("Your password is: ").append(password).append("\n\n");
            body.append("For security reasons, please consider changing your password after logging in.\n\n");
        }
        
        body.append("If you did not request this password recovery, please contact our support team immediately.\n\n");
        body.append("Best regards,\n");
        body.append("PayFlow Technologies Team\n");
        body.append("Email: hr@payflow.com\n");
        body.append("Phone: +91 80 1234 5678");
        
        return body.toString();
    }

}
