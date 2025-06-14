package dku25.virtualization.project.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dku25.virtualization.project.domain.FileMeta;
import dku25.virtualization.project.dto.FileResponseDTO;
import dku25.virtualization.project.repository.FileMetaRepository;

@RestController
@RequestMapping("/files")
public class FileController {
  
  @Autowired
  private FileMetaRepository fileMetaRepository;

  @GetMapping
  public ResponseEntity<List<FileResponseDTO>> getMyFiles(@AuthenticationPrincipal UserDetails userDetails) {
    String username = userDetails.getUsername();

    // 사용자의 파일 목록 조회
    List<FileMeta> fileList = fileMetaRepository.findAllByUsername(username);

    // DTO로 변환
    List<FileResponseDTO> result = fileList.stream()
        .map(file -> new FileResponseDTO(
            file.getId(),
            file.getSize(),
            file.getUsername(),
            file.getOriginalFilename(),
            file.getUploadTime(),
            file.getLinkId(),
            file.getPermission(),
            file.getContentType()
        )).collect(Collectors.toList());

    return ResponseEntity.ok(result);
}
  
}
