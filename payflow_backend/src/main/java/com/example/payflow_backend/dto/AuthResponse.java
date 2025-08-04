package com.example.payflow_backend.dto;

public class AuthResponse {
    private String message;
    private Object data;

    public AuthResponse(String message, Object data) {
        this.message = message;
        this.data = data;
    }

    // Getters and Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
}
