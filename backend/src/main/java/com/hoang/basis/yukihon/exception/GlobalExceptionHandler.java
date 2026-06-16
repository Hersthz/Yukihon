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
import org.springframework.web.server.ResponseStatusException;

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

    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<ApiError> handleServiceUnavailable(
            ServiceUnavailableException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.SERVICE_UNAVAILABLE, ex.getMessage(), request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        ErrorCode code = switch (status) {
            case NOT_FOUND -> ErrorCode.NOT_FOUND;
            case CONFLICT -> ErrorCode.CONFLICT;
            case FORBIDDEN -> ErrorCode.ACCESS_DENIED;
            case UNAUTHORIZED -> ErrorCode.UNAUTHORIZED;
            case BAD_REQUEST -> ErrorCode.BAD_REQUEST;
            default -> ErrorCode.INTERNAL_ERROR;
        };
        String message = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        return buildErrorResponse(status, code, message, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleOther(
            Exception ex,
            HttpServletRequest request
    ) {
                return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Unexpected internal error", request);
    }
}
