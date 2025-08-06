package com.example.payflow_backend.exception;

public class InsufficientLeavesException extends RuntimeException {
    
    private final int remainingLeaves;
    private final int requestedLeaves;

    public InsufficientLeavesException(String message) {
        super(message);
        this.remainingLeaves = 0;
        this.requestedLeaves = 0;
    }

    public InsufficientLeavesException(String message, int remainingLeaves, int requestedLeaves) {
        super(message);
        this.remainingLeaves = remainingLeaves;
        this.requestedLeaves = requestedLeaves;
    }

    public int getRemainingLeaves() {
        return remainingLeaves;
    }

    public int getRequestedLeaves() {
        return requestedLeaves;
    }
}
