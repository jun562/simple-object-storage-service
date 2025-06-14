package dku25.virtualization.project.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class FileMeta {
  
  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  private Long size;
  private String originalFilename;
  private String storedFilename;
  private String username;
  private String contentType;
  private LocalDateTime uploadTime;
  private String permission; // public, private, protected
  private String linkId; // UUID로 생성
  private String password; // protected일 경우만 사용
  
  

}
