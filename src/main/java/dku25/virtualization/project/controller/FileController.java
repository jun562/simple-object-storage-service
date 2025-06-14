package dku25.virtualization.project.controller;

import java.io.File;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dku25.virtualization.project.domain.FileMeta;
import dku25.virtualization.project.dto.FileListItemDTO;
import dku25.virtualization.project.dto.FileResponseDTO;
import dku25.virtualization.project.dto.PermissionDTO;
import dku25.virtualization.project.repository.FileMetaRepository;

@RestController
@RequestMapping("/files")
public class FileController {
  
  @Autowired
  private FileMetaRepository fileMetaRepository;

  @GetMapping
  public ResponseEntity<List<FileListItemDTO>> getMyFiles(@AuthenticationPrincipal UserDetails userDetails) {
    String username = userDetails.getUsername();

    // 사용자의 파일 목록 조회
    List<FileMeta> fileList = fileMetaRepository.findAllByUsername(username);

    // DTO로 변환
    List<FileListItemDTO> result = fileList.stream()
        .map(file -> new FileListItemDTO(
            file.getId(),
            file.getOriginalFilename(),
            file.getLinkId(),
            file.getPermission()
        )).collect(Collectors.toList());
        
    return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFileMeta(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();

        FileMeta file = fileMetaRepository.findById(id)
            .orElse(null);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        if (!file.getUsername().equals(username)) {
            return ResponseEntity.status(403).body("접근 권한이 없습니다.");
        }

        FileResponseDTO dto = new FileResponseDTO(
            file.getId(),
            file.getSize(),
            file.getUsername(),
            file.getOriginalFilename(),
            file.getUploadTime(),
            file.getLinkId(),
            file.getPermission(),
            file.getContentType()
        );

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();

        FileMeta file = fileMetaRepository.findById(id).orElse(null);

        if (file == null) {
         return ResponseEntity.notFound().build();
        }

        if (!file.getUsername().equals(username)) {
            return ResponseEntity.status(403).body("접근 권한이 없습니다.");
        }

        // 실제 저장된 파일 경로
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File actualFile = new File(uploadDir + file.getStoredFilename());

        if (actualFile.exists()) {
            if (!actualFile.delete()) {
                return ResponseEntity.status(500).body("파일 삭제에 실패하였습니다.");
            }
        }

        // DB에서 메타데이터 삭제
        fileMetaRepository.delete(file);

        return ResponseEntity.ok("파일 삭제가 완료되었습니다.");
    }
    @PutMapping("/{id}/permission")
    public ResponseEntity<?> updatePermission(@PathVariable Long id, @RequestBody PermissionDTO request, @AuthenticationPrincipal UserDetails userDetails)
    {
        String username = userDetails.getUsername();

        FileMeta file = fileMetaRepository.findById(id).orElse(null);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        if (!file.getUsername().equals(username)) {
            return ResponseEntity.status(403).body("접근 권한이 없습니다.");
        }

        String permission = request.getPermission();
        
        if (!permission.equals("public") && !permission.equals("private") && !permission.equals("protected")) {
            return ResponseEntity.badRequest().body("permission 값은 public, private, protected 중 하나여야 합니다.");
        }

        if (permission.equals("protected") && (request.getPassword() == null || request.getPassword().trim().isEmpty())) {
            return ResponseEntity.badRequest().body("protected 권한은 비밀번호가 필요합니다.");
        }

        file.setPermission(permission);
        file.setPassword(permission.equals("protected") ? request.getPassword() : null);

        fileMetaRepository.save(file);

        return ResponseEntity.ok("권한 변경이 완료되었습니다.");
    }
    
}
