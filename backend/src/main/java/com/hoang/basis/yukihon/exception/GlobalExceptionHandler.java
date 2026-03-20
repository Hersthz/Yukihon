package com.hoang.basis.yukihon.exception;

import jakarta.servlet.http.HttpServletRequest;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<ApiError> buildErrorResponse(
            HttpStatus status,
            ErrorCode code,
            String message,
            HttpServletRequest request
    ) {
        ApiError body = new ApiError(
                status.value(),
                code.name(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse("Invalid request");

                return buildErrorResponse(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, message, request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request
    ) {
                return buildErrorResponse(HttpStatus.UNAUTHORIZED, ErrorCode.BAD_CREDENTIALS, ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {
                return buildErrorResponse(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
                return buildErrorResponse(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, ex.getMessage(), request);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiError> handleAccessDenied(
                        AccessDeniedException ex,
                        HttpServletRequest request
        ) {
                return buildErrorResponse(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, "Access denied", request);
        }

        @ExceptionHandler(ExpiredJwtException.class)
        public ResponseEntity<ApiError> handleExpiredToken(
                        ExpiredJwtException ex,
                        HttpServletRequest request
        ) {
                return buildErrorResponse(HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED, "Token has expired", request);
        }

        @ExceptionHandler(JwtException.class)
        public ResponseEntity<ApiError> handleJwtException(
                        JwtException ex,
                        HttpServletRequest request
        ) {
                return buildErrorResponse(HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_INVALID, "Invalid token", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleOther(
            Exception ex,
            HttpServletRequest request
    ) {
                return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Unexpected internal error", request);
    }
}
