package dku25.virtualization.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PermissionDTO {
  private String permission; //"public" "private" "protected"
  private String password; // protected인 경우
}
