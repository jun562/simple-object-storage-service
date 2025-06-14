package dku25.virtualization.project.controller;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import dku25.virtualization.project.domain.FileMeta;
import dku25.virtualization.project.repository.FileMetaRepository;
import dku25.virtualization.project.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class FileUploadController {
  
  private static final String upload_dir = System.getProperty("user.dir") + "/uploads/";

  @Autowired
  private FileMetaRepository fileMetaRepository;

  @Autowired
  private JwtUtil jwtUtil;

  //파일 업로드 API
  @PostMapping("/upload")
  public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, HttpServletRequest request) throws IOException {

    String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")){
      return ResponseEntity.status(401).body("인증 토큰 없음");
    }

    String token = authHeader.substring(7);
    String username;
    try{
      username = jwtUtil.extractUsername(token);
    } catch (JwtException e) {
      return ResponseEntity.status(401).body("유효하지 않은 토큰");
    }
    
    // 업로드 디렉토리 생성
    File dir = new File(upload_dir);
    if (!dir.exists()) dir.mkdirs();

    //저장할 파일명 생성
    String originalFilename = file.getOriginalFilename();
    String extension = StringUtils.getFilenameExtension(originalFilename);
    String storedFilename = UUID.randomUUID() + "." + extension;

    //파일 저장
    file.transferTo(new File(upload_dir + storedFilename));

    //메타데이터 저장
    FileMeta meta = new FileMeta();
    meta.setSize(file.getSize());
    meta.setOriginalFilename(originalFilename);
    meta.setStoredFilename(storedFilename);
    meta.setUsername(username);
    meta.setContentType(file.getContentType());
    meta.setUploadTime(LocalDateTime.now());
    meta.setPermission("private"); // 기본은 private
    meta.setLinkId(UUID.randomUUID().toString());
    meta.setPassword(null);
    

    fileMetaRepository.save(meta);

    return ResponseEntity.ok("파일 업로드 완료. 링크 ID: " + meta.getLinkId());

  }
}
