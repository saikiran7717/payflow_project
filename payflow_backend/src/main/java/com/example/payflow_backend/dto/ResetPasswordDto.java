package com.example.payflow_backend.dto;

public class ResetPasswordDto {
    private String username;
    private String newPassword;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
