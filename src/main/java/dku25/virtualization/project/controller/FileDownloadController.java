package dku25.virtualization.project.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dku25.virtualization.project.domain.FileMeta;
import dku25.virtualization.project.repository.FileMetaRepository;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class FileDownloadController {
  
  @Autowired FileMetaRepository fileMetaRepository;

  @GetMapping("/download/{linkId}")
  public void downloadFile( @PathVariable String linkId, @RequestParam(value = "password", required = false) String password, @AuthenticationPrincipal UserDetails userDetails, HttpServletResponse response) throws Exception {
    
        FileMeta file = fileMetaRepository.findByLinkId(linkId).orElse(null);

        if (file == null) {
            response.sendError(404, "파일을 찾을 수 없습니다.");
            return;
        }

        String permission = file.getPermission();

        // 권한 검사
        if (permission.equals("private")) {
            if (userDetails == null || !file.getUsername().equals(userDetails.getUsername())) {
                response.sendError(403, "접근 권한이 없습니다.");
                return;
            }
        }

        if (permission.equals("protected")) {
            if (password == null || !password.equals(file.getPassword())) {
                response.sendError(403, "비밀번호가 일치하지 않습니다.");
                return;
            }
        }

        // 파일 경로 설정
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File actualFile = new File(uploadDir + file.getStoredFilename());

        if (!actualFile.exists()) {
            response.sendError(404, "실제 파일이 존재하지 않습니다.");
            return;
        }

        // 헤더 설정: 브라우저에서 열 수 있도록
        response.setContentType(file.getContentType());
        response.setHeader("Content-Disposition", "inline; filename=\"" + file.getOriginalFilename() + "\"");
        response.setContentLengthLong(file.getSize());

        // 파일 스트림 전송
        try (FileInputStream in = new FileInputStream(actualFile);
             OutputStream out = response.getOutputStream()) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
    }
}
