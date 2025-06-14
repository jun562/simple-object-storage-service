package dku25.virtualization.project.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileResponseDTO {
    private Long id;
    private Long size;
    private String username;
    private String originalFilename;
    private LocalDateTime uploadTime;
    private String linkId;
    private String permission;
    private String contentType;
}
