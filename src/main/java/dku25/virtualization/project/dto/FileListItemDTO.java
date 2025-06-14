package dku25.virtualization.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileListItemDTO {
    private Long id;
    private String originalFilename;
    private String linkId;
    private String permission;
}
