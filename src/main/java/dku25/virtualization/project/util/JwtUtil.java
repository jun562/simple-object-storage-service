package dku25.virtualization.project.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Jwts.SIG;

import io.jsonwebtoken.security.Keys;


@Component
public class JwtUtil {

    private final SecretKey secretKey = Keys.hmacShaKeyFor("nu1t8forqgoTV+b0DPRKg2+/ycGMfyoaPKXVUx1mOPc=".getBytes(StandardCharsets.UTF_8));

    private final long expirationMs = 1000 * 60 * 60; // 1시간

     public String generateToken(String username) {
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(secretKey, SIG.HS256)
            .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
